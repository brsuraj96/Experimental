import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { BaseSettings, GameType, GameSettingsType } from "../types";
import {
  SudokuSettings,
  SlideTilesSettings,
  FlowFreeSettings,
  WordSearchSettings,
  CrosswordSettings,
  WaterFlowSettings,
  MatchstickSettings,
  SpotDifferenceSettings,
  Language,
  FontSize,
} from "../types/settings";

// Default settings for each game type
const defaultBaseSettings: BaseSettings = {
  audioEffect: true,
  vibration: true,
  darkMode: false,
  fontSize: "medium" as FontSize,
  language: "en" as Language,
};

const defaultGameSettings = {
  timer: true,
  smartHint: true,
  showScore: true,
  showProgress: true,
};

export const defaultSudokuSettings: SudokuSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
  mistakeLimit: false,
  numberFirst: false,
  highlightPeer: true,
  highlightSameNumbers: true,
  autoRemoveNotes: true,
  remainingNumbers: true,
};

const defaultSlideTilesSettings: SlideTilesSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
  showMoves: true,
};

const defaultFlowFreeSettings: FlowFreeSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
  showMoves: true,
};

const defaultWordSearchSettings: WordSearchSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
};

const defaultCrosswordSettings: CrosswordSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
};

const defaultWaterFlowSettings: WaterFlowSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
  showMoves: true,
};

const defaultMatchstickSettings: MatchstickSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
};

const defaultSpotDifferenceSettings: SpotDifferenceSettings = {
  ...defaultBaseSettings,
  ...defaultGameSettings,
};

const defaultTriviaSettings: BaseSettings = {
  ...defaultBaseSettings,
};

const defaultRiddlesSettings: BaseSettings = {
  ...defaultBaseSettings,
};

interface SettingsContextType {
  baseSettings: BaseSettings;
  gameSettings: {
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
  currentGameType: GameType;
  updateBaseSettings: (settings: Partial<BaseSettings>) => void;
  updateGameSettings: <T extends GameType>(
    gameType: T,
    settings: Partial<GameSettingsType[T]>
  ) => void;
  setCurrentGameType: (gameType: GameType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [baseSettings, setBaseSettings] =
    useState<BaseSettings>(defaultBaseSettings);
  const [currentGameType, setCurrentGameType] = useState<GameType>(
    GameType.SUDOKU
  );
  const [gameSettings, setGameSettings] = useState({
    [GameType.SUDOKU]: defaultSudokuSettings,
    [GameType.SLIDE_TILES]: defaultSlideTilesSettings,
    [GameType.FLOW_FREE]: defaultFlowFreeSettings,
    [GameType.WORDSEARCH]: defaultWordSearchSettings,
    [GameType.CROSSWORD]: defaultCrosswordSettings,
    [GameType.WATER_FLOW]: defaultWaterFlowSettings,
    [GameType.MATCHSTICK]: defaultMatchstickSettings,
    [GameType.SPOT_DIFFERENCE]: defaultSpotDifferenceSettings,
    [GameType.TRIVIA]: defaultTriviaSettings,
    [GameType.RIDDLES]: defaultRiddlesSettings,
  });

  const updateBaseSettings = useCallback(
    (newSettings: Partial<BaseSettings>) => {
      setBaseSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  const updateGameSettings = useCallback(
    <T extends GameType>(
      gameType: T,
      newSettings: Partial<GameSettingsType[T]>
    ) => {
      setGameSettings((prev) => ({
        ...prev,
        [gameType]: {
          ...prev[gameType],
          ...newSettings,
        },
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      baseSettings,
      gameSettings,
      currentGameType,
      updateBaseSettings,
      updateGameSettings,
      setCurrentGameType,
    }),
    [
      baseSettings,
      gameSettings,
      currentGameType,
      updateBaseSettings,
      updateGameSettings,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
