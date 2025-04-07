// Game Types
export enum GameType {
  SUDOKU = 'Sudoku',
  SLIDE_TILES = 'Slide Tiles',
  FLOW_FREE = 'Flow Free',
  CROSSWORD = 'Crossword',
  JIGSAW = 'Jigsaw',
  MATCHSTICK = 'Matchstick',
  SPOT_DIFFERENCE = 'Spot the Difference',
  WATER_FLOW = 'Water Flow',
  TRIVIA = 'Trivia',
  RIDDLES = 'Riddles'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface GameInfo {
  id: GameType;
  title: string;
  description: string;
  color: string;
  implemented: boolean;
}

// Sudoku Types
export type SudokuCell = {
  value: number | null;
  isFixed: boolean;
  notes: boolean[];
  isHighlighted?: boolean;
  isError?: boolean;
};

export type SudokuBoard = SudokuCell[][];

// Slide Tiles Types
export type SlideTileBoard = number[][];

export interface SlideTilePosition {
  row: number;
  col: number;
}

// Flow Free Types
export enum FlowColor {
  RED = '#EF5350',
  BLUE = '#4DD0E1',
  GREEN = '#81C784',
  YELLOW = '#FFEB3B',
  PURPLE = '#9C27B0',
  ORANGE = '#FF9800',
  PINK = '#E91E63',
  CYAN = '#00BCD4',
  LIME = '#CDDC39',
  TEAL = '#009688'
}

export interface FlowPoint {
  row: number;
  col: number;
  color: FlowColor;
  isEndpoint: boolean;
  connections: FlowConnection[];
}

export interface FlowConnection {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  color: FlowColor;
}

export type FlowBoard = (FlowPoint | null)[][];

export interface FlowLevel {
  size: number;
  endpoints: {row: number, col: number, color: FlowColor}[];
}

// Game progress
export interface GameProgress {
  [GameType.SUDOKU]: {
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
  };
  [GameType.SLIDE_TILES]: {
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
  };
  [GameType.FLOW_FREE]: {
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Game: { gameType: GameType; difficulty: Difficulty };
  Completion: { gameType: GameType; difficulty: Difficulty; time: number; moves: number };
};
