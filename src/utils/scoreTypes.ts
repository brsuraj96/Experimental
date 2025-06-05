export type BonusType =
  | "streak"
  | "noHints"
  | "perfectGame"
  | "combo"
  | "speedBonus"
  | "chainBonus";

export type PenaltyType = "mistake" | "hint" | "redo";

export interface ScoreNotification {
  type: "bonus" | "penalty" | "achievement";
  points: number;
  message: string;
  icon?: string;
  delay?: number;
}

export interface ScoreSnapshot {
  currentScore: number;
  previousScore: number;
  streakCount: number;
  bonusMultiplier: number;
  notifications: ScoreNotification[];
  stats: {
    correctMoves: number;
    mistakes: number;
    hints: number;
    streaks: number;
    timeElapsed: number;
    combo: number;
  };
}
