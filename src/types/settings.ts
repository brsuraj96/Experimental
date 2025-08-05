import { StyleProp, ViewStyle } from "react-native";
import { GameType } from "./index";
import { Theme } from "../styles/theme";
import { RootStackParamList } from "../types";

export type Language = "en" | "es" | "fr";
export type FontSize = "small" | "medium" | "large";

// Base settings that apply to all games
export interface BaseSettings {
  audioEffect: boolean;
  vibration: boolean;
  darkMode: boolean;
  fontSize: FontSize;
  language: Language;
}

// Common settings that apply to most games
export interface CommonGameSettings {
  timer: boolean;
  smartHint: boolean;
  showProgress: boolean;
}

// Game-specific settings
export interface SudokuSettings extends BaseSettings, CommonGameSettings {
  smartHint: boolean;
  showProgress: boolean;
  mistakeLimit: boolean;
  numberFirst: boolean;
  highlightPeer: boolean;
  highlightSameNumbers: boolean;
  autoRemoveNotes: boolean;
  remainingNumbers: boolean;
  showScore: boolean;
  remainingHints: number; // Added to track the number of remaining hints
}

export interface SlideTilesSettings extends BaseSettings, CommonGameSettings {
  showMoves: boolean;
}

export interface FlowFreeSettings extends BaseSettings, CommonGameSettings {
  showMoves: boolean;
}

export interface WordSearchSettings extends BaseSettings, CommonGameSettings {}

export interface CrosswordSettings extends BaseSettings, CommonGameSettings {}

export interface WaterFlowSettings extends BaseSettings, CommonGameSettings {
  showMoves: boolean;
}

export interface MatchstickSettings extends BaseSettings, CommonGameSettings {}

export interface SpotDifferenceSettings
  extends BaseSettings,
    CommonGameSettings {}

// Settings type mapping for each game
export type GameSettingsType = {
  [GameType.SUDOKU]: SudokuSettings;
  [GameType.SLIDE_TILES]: SlideTilesSettings;
  [GameType.FLOW_FREE]: FlowFreeSettings;
  [GameType.WORDSEARCH]: WordSearchSettings;
  [GameType.CROSSWORD]: CrosswordSettings;
  [GameType.WATER_FLOW]: WaterFlowSettings;
  [GameType.MATCHSTICK]: MatchstickSettings;
  [GameType.SPOT_DIFFERENCE]: SpotDifferenceSettings;
  [GameType.TRIVIA]: BaseSettings;
  [GameType.RIDDLES]: BaseSettings;
};

export type SettingKey = keyof BaseSettings | keyof GameSettingsType[GameType];
export type LinkKey = "quit" | keyof RootStackParamList;

// Settings UI types
export interface BaseSettingItem {
  type: "toggle" | "option" | "link";
  key: SettingKey | LinkKey;
  label: string;
  icon: string;
  description?: string;
}

export interface ToggleSettingItem extends BaseSettingItem {
  type: "toggle";
}

export interface OptionSettingItem extends BaseSettingItem {
  type: "option";
  options: Array<{ label: string; value: Language | FontSize }>;
}

export interface LinkSettingItem extends BaseSettingItem {
  type: "link";
  onPress?: () => void;
}

export type SettingItem =
  | ToggleSettingItem
  | OptionSettingItem
  | LinkSettingItem;

export interface SettingSection {
  title: string;
  items: SettingItem[];
}

// Component props types
export interface DropdownProps {
  value: Language | FontSize;
  options: Array<{ label: string; value: Language | FontSize }>;
  onValueChange: (value: Language | FontSize) => void;
  style?: StyleProp<ViewStyle>;
}

export interface SettingItemComponentProps {
  item: SettingItem;
  value: boolean | Language | FontSize;
  onValueChange: (
    key: SettingKey,
    value: boolean | Language | FontSize
  ) => void;
  theme: Theme;
  onPress?: () => void;
}
