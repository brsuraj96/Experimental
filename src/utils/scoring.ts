import { Difficulty, GameType } from "../types";
import {
  ScoreConfig,
  ScoreEvent,
  ScoreNotification,
  GameScoreConfig,
  ScoreMetadata,
  ScoreStats,
} from "../types/scoring";

const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  difficultyMultiplier: {
    [Difficulty.BEGINNER]: 1.0,
    [Difficulty.EASY]: 1.2,
    [Difficulty.MEDIUM]: 1.5,
    [Difficulty.HARD]: 2.0,
    [Difficulty.EXPERT]: 3.0,
  },
  games: {
    [GameType.SUDOKU]: {
      basePoints: 100,
      bonusPoints: {
        streak: 10,
        comboBase: 5,
        comboMultiplier: 1.5,
        noHints: 100,
        perfectGame: 200,
        speedBonus: {
          threshold: 180,
          points: 150,
        },
        chainBonus: {
          threshold: 5,
          points: 50,
        },
      },
      penalties: {
        mistake: -30,
        hint: -20,
        streakBreak: -10,
      },
      timeBonus: {
        threshold: 300,
        points: 200,
      },
    },
    // ...existing game configs...
  },
};

export class ScoreManager {
  private config: ScoreConfig;
  private gameConfig: GameScoreConfig;
  private currentScore: number = 0;
  private previousScore: number = 0;
  private events: ScoreEvent[] = [];
  private notifications: ScoreNotification[] = [];
  private difficulty: Difficulty;
  private gameType: GameType;
  private startTime: number;
  private lastMoveTime: number;
  private comboCount: number = 0;
  private chainCount: number = 0;
  private notificationId: number = 0;
  constructor(
    gameType: GameType,
    difficulty: Difficulty,
    config: Partial<ScoreConfig> = {}
  ) {
    this.config = { ...DEFAULT_SCORE_CONFIG, ...config };
    this.gameType = gameType;
    this.difficulty = difficulty;
    this.gameConfig = this.config.games[gameType] || {
      basePoints: 100,
      bonusPoints: {},
      penalties: { mistake: -20, hint: -10 },
    };
    this.startTime = Date.now();
    this.lastMoveTime = this.startTime;
  }

  private createEvent(
    type: ScoreEvent["type"],
    value?: number | Difficulty,
    metadata?: ScoreMetadata
  ): ScoreEvent {
    return {
      type,
      timestamp: Date.now(),
      value,
      metadata,
    };
  }

  private addEvent(eventData: Omit<ScoreEvent, "timestamp">): void {
    const event: ScoreEvent = {
      ...eventData,
      timestamp: Date.now(),
    };
    this.events.push(event);
    this.updateScore();
  }

  private createNotification(
    type: "bonus" | "penalty" | "info" | "achievement",
    points: number,
    message: string,
    options: Partial<ScoreNotification> = {}
  ): ScoreNotification {
    const notification: ScoreNotification = {
      id: ++this.notificationId,
      type,
      points,
      message,
      timestamp: Date.now(),
      duration: options.duration || 2000,
      color:
        options.color ||
        (type === "bonus"
          ? "#4CAF50"
          : type === "penalty"
          ? "#f44336"
          : type === "info"
          ? "#2196F3"
          : "#FFC107"),
      icon: options.icon,
    };
    this.notifications.push(notification);
    return notification;
  }

  private updateCombo(isCorrect: boolean): void {
    if (isCorrect) {
      this.comboCount++;
      const timeSinceLastMove = Date.now() - this.lastMoveTime;

      // Update chain if move was quick enough (within 2 seconds)
      if (timeSinceLastMove < 2000) {
        this.chainCount++;
        if (
          this.chainCount >=
          (this.gameConfig.bonusPoints.chainBonus?.threshold || 5)
        ) {
          const bonus = this.gameConfig.bonusPoints.chainBonus?.points || 50;
          this.addEvent({
            type: "bonus",
            value: bonus,
            metadata: { bonusType: "chain", chainCount: this.chainCount },
          });
          this.notifications.push(
            this.createNotification(
              "bonus",
              bonus,
              `Chain x${this.chainCount}!`,
              {
                icon: "⚡",
                color: "#FFD700",
              }
            )
          );
        }
      } else {
        this.chainCount = 1;
      }

      // Apply combo multiplier
      if (this.comboCount > 1) {
        const comboBonus = Math.floor(
          (this.gameConfig.bonusPoints.comboBase || 5) *
            Math.pow(
              this.gameConfig.bonusPoints.comboMultiplier || 1.5,
              this.comboCount - 1
            )
        );
        this.addEvent({
          type: "bonus",
          value: comboBonus,
          metadata: { bonusType: "combo", comboCount: this.comboCount },
        });
        this.notifications.push(
          this.createNotification(
            "bonus",
            comboBonus,
            `Combo x${this.comboCount}!`,
            {
              icon: "🔥",
            }
          )
        );
      }
    } else {
      if (this.comboCount > 2) {
        this.notifications.push(
          this.createNotification(
            "penalty",
            0,
            `Combo Break! (${this.comboCount}x)`,
            {
              icon: "💔",
            }
          )
        );
      }
      this.comboCount = 0;
      this.chainCount = 0;
    }
    this.lastMoveTime = Date.now();
  }
  addCorrectMove(metadata?: ScoreMetadata): void {
    this.previousScore = this.currentScore;

    // Add base points
    this.addEvent({
      type: "correctMove",
      value: this.gameConfig.basePoints,
      metadata,
    });

    // Update combo system
    this.updateCombo(true);

    // Handle streak bonus
    if (metadata?.isStreak) {
      const streakBonus = this.gameConfig.bonusPoints.streak || 10;
      this.addEvent({
        type: "bonus",
        value: streakBonus,
        metadata: { bonusType: "streak" },
      });
      this.notifications.push(
        this.createNotification("bonus", streakBonus, "Streak Bonus!", {
          icon: "🎯",
        })
      );
    }
  }

  addMistake(metadata?: Record<string, any>): void {
    this.previousScore = this.currentScore;
    const penalty = this.gameConfig.penalties.mistake;

    this.addEvent({
      type: "mistake",
      value: penalty,
      metadata,
    });

    this.updateCombo(false);

    this.notifications.push(
      this.createNotification("penalty", penalty, "Mistake!", {
        icon: "❌",
      })
    );
  }

  addHintUsed(metadata?: Record<string, any>): void {
    this.previousScore = this.currentScore;
    const penalty = this.gameConfig.penalties.hint;

    this.addEvent({
      type: "hint",
      value: penalty,
      metadata,
    });

    this.updateCombo(false);

    this.notifications.push(
      this.createNotification("penalty", penalty, "Hint Used", {
        icon: "💡",
      })
    );
  }

  applyCompletionBonuses(): void {
    const timeElapsed = (Date.now() - this.startTime) / 1000;

    // Speed bonus
    if (
      this.gameConfig.bonusPoints.speedBonus &&
      timeElapsed < this.gameConfig.bonusPoints.speedBonus.threshold
    ) {
      const speedBonus = this.gameConfig.bonusPoints.speedBonus.points;
      this.addEvent({
        type: "completionBonus",
        value: speedBonus,
        metadata: { bonusType: "speed", timeElapsed },
      });
      this.notifications.push(
        this.createNotification("achievement", speedBonus, "Speed Bonus!", {
          icon: "⚡",
          duration: 3000,
        })
      );
    }

    // No hints bonus
    if (
      !this.events.some((e) => e.type === "hint") &&
      this.gameConfig.bonusPoints.noHints
    ) {
      const noHintsBonus = this.gameConfig.bonusPoints.noHints;
      this.addEvent({
        type: "completionBonus",
        value: noHintsBonus,
        metadata: { bonusType: "noHints" },
      });
      this.notifications.push(
        this.createNotification("achievement", noHintsBonus, "No Hints Used!", {
          icon: "🎓",
          duration: 3000,
        })
      );
    }

    // Perfect game bonus
    if (
      !this.events.some((e) => e.type === "mistake") &&
      this.gameConfig.bonusPoints.perfectGame
    ) {
      const perfectBonus = this.gameConfig.bonusPoints.perfectGame;
      this.addEvent({
        type: "completionBonus",
        value: perfectBonus,
        metadata: { bonusType: "perfectGame" },
      });
      this.notifications.push(
        this.createNotification("achievement", perfectBonus, "Perfect Game!", {
          icon: "🏆",
          duration: 3000,
        })
      );
    }
  }

  public setDifficulty(difficulty: Difficulty): void {
    if (this.difficulty === difficulty) return;

    // Store old difficulty for notification
    const oldDifficulty = this.difficulty;
    this.difficulty = difficulty;

    // Add event for scoring history
    this.addEvent(
      this.createEvent("difficulty_change", difficulty, { icon: "🎚️" })
    );

    // Create notification about difficulty change
    const message = `Difficulty changed to ${difficulty}`;
    this.createNotification("info", 0, message, {
      duration: 3000,
      color: "#2196F3",
      icon: "🎚️",
    });

    // Recalculate score with new difficulty
    this.updateScore();
  }

  // Add getter for current difficulty
  public getDifficulty(): Difficulty {
    return this.difficulty;
  }

  getScore(): number {
    return Math.max(0, Math.round(this.currentScore));
  }

  getPreviousScore(): number {
    return Math.max(0, Math.round(this.previousScore));
  }

  getNotifications(): ScoreNotification[] {
    const current = [...this.notifications];
    this.notifications = [];
    return current;
  }

  private updateScore(): void {
    this.previousScore = this.currentScore;
    this.currentScore = this.calculateScore();
  }

  private calculateScore(): number {
    let score = 0;
    for (const event of this.events) {
      if (event.type === "difficulty_change") continue; // Skip difficulty change events for direct score calculation
      if (typeof event.value === "number") {
        score +=
          event.value * this.config.difficultyMultiplier[this.difficulty];
      }
    }
    return Math.max(0, score); // Ensure score doesn't go below 0
  }

  getStats(): ScoreStats {
    const eventCounts = this.events.reduce((acc, event) => {
      if (
        event.type === "correctMove" ||
        event.type === "mistake" ||
        event.type === "hint"
      ) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      score: this.getScore(),
      correctMoves: eventCounts.correctMove || 0,
      mistakes: eventCounts.mistake || 0,
      hints: eventCounts.hint || 0,
      streaks: this.events.filter((e) => e.metadata?.bonusType === "streak")
        .length,
      combos: this.comboCount,
      chainCount: this.chainCount,
      timeElapsed: (Date.now() - this.startTime) / 1000,
      multiplier: this.config.difficultyMultiplier[this.difficulty],
    };
  }
}
