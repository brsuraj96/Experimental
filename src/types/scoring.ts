import { Difficulty, GameType } from "./index";

export interface TimeBonus {
  threshold: number;
  points: number;
}

export interface ChainBonus {
  threshold: number;
  points: number;
}

export interface GameScoreConfig {
  basePoints: number;
  bonusPoints: {
    streak?: number;
    comboBase?: number;
    comboMultiplier?: number;
    noHints?: number;
    perfectGame?: number;
    speedBonus?: TimeBonus;
    chainBonus?: ChainBonus;
  };
  penalties: {
    mistake: number;
    hint: number;
    streakBreak?: number;
  };
  timeBonus?: TimeBonus;
  multipliers?: {
    combo?: number;
    chain?: number;
    speed?: number;
  };
}

export interface ScoreConfig {
  difficultyMultiplier: {
    [key in Difficulty]: number;
  };
  games: {
    [key in GameType]?: GameScoreConfig;
  };
}

export interface ScoreMetadata {
  bonusType?: string;
  comboCount?: number;
  chainCount?: number;
  timeElapsed?: number;
  icon?: string;
  isStreak?: boolean;
}

export interface ScoreEvent {
  type:
    | "correctMove"
    | "mistake"
    | "hint"
    | "bonus"
    | "penalty"
    | "completionBonus"
    | "difficulty_change"
    | "info"
    | "achievement";
  timestamp: number;
  value?: number | Difficulty;
  message?: string;
  metadata?: ScoreMetadata;
}

export interface ScoreStats {
  score: number;
  correctMoves: number;
  mistakes: number;
  hints: number;
  streaks: number;
  combos: number;
  chainCount: number;
  timeElapsed: number;
  multiplier: number;
}

export interface ScoreNotification {
  id: number;
  type: "bonus" | "penalty" | "info" | "achievement";
  points: number;
  message: string;
  timestamp: number;
  duration: number;
  color: string;
  icon?: string;
}
