// Game Types
export enum GameType {
  SUDOKU = "Sudoku",
  SLIDE_TILES = "Slide Tiles",
  FLOW_FREE = "Flow Free",
  CROSSWORD = "Crossword",
  WORDSEARCH = "Word Search",
  JIGSAW = "Jigsaw",
  MATCHSTICK = "Matchstick",
  SPOT_DIFFERENCE = "Spot the Difference",
  WATER_FLOW = "Water Flow",
  TRIVIA = "Trivia",
  RIDDLES = "Riddles",
}

export enum Difficulty {
  BEGINNER = "Beginner",
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
  EXPERT = "Expert",
}

export interface GameInfo {
  id: GameType;
  title: string;
  description: string;
  color: string;
  implemented: boolean;
}

// Sudoku Types
export interface SudokuCell {
  value: number | null;
  isFixed: boolean;
  isError: boolean;
  notes: boolean[];
}

export type SudokuBoard = SudokuCell[][];

// Slide Tiles Types
export type SlideTileBoard = number[][];

export interface SlideTilePosition {
  row: number;
  col: number;
}

export interface Matchstick {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isMovable: boolean;
  isSelected: boolean;
  isPlaced: boolean;
}

export interface DifferenceSpot {
  id: string;
  x: number;
  y: number;
  radius: number;
  isFound: boolean;
}

export interface SpotDifferenceLevel {
  id: string;
  imageA: string;
  imageB: string;
  differences: DifferenceSpot[];
  difficulty: Difficulty;
}

// Word Search Types
export interface WordSearchCell {
  letter: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isFound: boolean;
  row: number;
  col: number;
}

export type WordSearchBoard = WordSearchCell[][];

export interface WordSearchWord {
  word: string;
  isFound: boolean;
  row: number;
  col: number;
  direction:
    | "horizontal"
    | "horizontal-reverse"
    | "vertical"
    | "vertical-reverse"
    | "diagonal-right"
    | "diagonal-left"
    | "diagonal-right-reverse"
    | "diagonal-left-reverse";
}

export interface WordSearchLevel {
  size: number;
  board: WordSearchBoard;
  words: WordSearchWord[];
  difficulty: Difficulty;
}

// Flow Free Types
export enum FlowColor {
  RED = "#EF5350",
  BLUE = "#4DD0E1",
  GREEN = "#81C784",
  YELLOW = "#FFEB3B",
  PURPLE = "#9C27B0",
  ORANGE = "#FF9800",
  PINK = "#E91E63",
  CYAN = "#00BCD4",
  LIME = "#CDDC39",
  TEAL = "#009688",
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
  endpoints: { row: number; col: number; color: FlowColor }[];
}

// Water Flow Puzzle Types

export enum PipeType {
  STRAIGHT = "straight",
  CORNER = "corner",
  T_SHAPE = "t-shape",
  CROSS = "cross",
  SOURCE = "source",
  DESTINATION = "destination",
  EMPTY = "empty",
}

export interface PipeCell {
  type: PipeType;
  rotation: 0 | 90 | 180 | 270; // Rotation in degrees
  isFixed: boolean;
  isConnected?: boolean; // Used for checking if pipe is part of the solution
  row: number;
  col: number;
}

export type WaterFlowBoard = PipeCell[][];

export interface WaterFlowLevel {
  size: number;
  board: WaterFlowBoard;
  sourcePosition: { row: number; col: number };
  destinationPosition: { row: number; col: number };
}

// Crossword Puzzle Types
export interface CrosswordCell {
  letter: string; // The correct letter for this cell
  userLetter: string; // The letter entered by the user
  isBlank: boolean; // Whether this is a blank/black cell
  number?: number; // The clue number for this cell (if applicable)
  isError?: boolean; // Whether the user's entry is incorrect
  isHighlighted?: boolean; // Whether this cell is highlighted/active
  row: number; // Row index
  col: number; // Column index
}

export type CrosswordBoard = CrosswordCell[][];

export interface CrosswordClue {
  number: number;
  text: string;
  direction: "across" | "down";
  row: number;
  col: number;
  length: number;
  answer: string;
}

export interface CrosswordLevel {
  size: number;
  board: CrosswordBoard;
  acrossClues: CrosswordClue[];
  downClues: CrosswordClue[];
}

// Game progress
export interface GameProgress {
  [GameType.SUDOKU]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.SLIDE_TILES]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.FLOW_FREE]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.WATER_FLOW]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.CROSSWORD]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.WORDSEARCH]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.MATCHSTICK]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.SPOT_DIFFERENCE]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.JIGSAW]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.TRIVIA]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
  [GameType.RIDDLES]: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.EASY]: number;
    [Difficulty.MEDIUM]: number;
    [Difficulty.HARD]: number;
    [Difficulty.EXPERT]: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Game: { gameType: GameType; difficulty: Difficulty };
  Completion: {
    gameType: GameType;
    difficulty: Difficulty;
    time: number;
    moves: number;
  };
  Settings: undefined;
  Premium: undefined;
  Statistics: undefined;
  HowToPlay: undefined;
  HelpCenter: undefined;
  About: undefined;
  Language: undefined;
};
