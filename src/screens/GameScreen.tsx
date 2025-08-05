import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  Vibration,
  AppState,
  AppStateStatus,
  useWindowDimensions,
} from "react-native";
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  RootStackParamList,
  GameType,
  Difficulty,
  BaseSettings,
  SudokuSettings,
  SlideTilesSettings,
  FlowFreeSettings,
  WordSearchSettings,
  CrosswordSettings,
  WaterFlowSettings,
  MatchstickSettings,
  SpotDifferenceSettings,
  Orientation,
  BaseGameProps,
  SudokuGameProps,
  SlideTilesGameProps,
  FlowFreeGameProps,
  WordSearchGameProps,
  CrosswordGameProps,
  WaterFlowGameProps,
  MatchstickGameProps,
  SpotDifferenceGameProps,
} from "../types";
import { theme } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import useOrientation from "../hooks/useOrientation";
import { useSound, SoundType } from "../hooks/useSound";
import Header from "../components/common/Header";
import Dialog from "../components/common/Dialog";
import SudokuGame, {
  SudokuGameHandle,
} from "../components/games/sudoku/SudokuGame";
import SlideTilesGame from "../components/games/slideTiles/SlideTilesGame";
import FlowFreeGame from "../components/games/flowFree/FlowFreeGame";
import WaterFlowGame from "../components/games/waterFlow/WaterFlowGame";
import CrosswordGame from "../components/games/crossword/CrosswordGame";
import WordSearchGame from "../components/games/wordSearch/WordSearchGame";
import SpotDifferenceGame from "../components/games/spotDifference/SpotDifferenceGame";
import MatchstickGame from "../components/games/matchstick/MatchstickGame";
import { useTimer } from "../context/TimerContext";
import { useLocalization } from "../context/LocalizationContext";

type GameScreenRouteProp = RouteProp<RootStackParamList, "Game">;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, "Game">;

interface GameScreenProps {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

// Memoize game components to prevent unnecessary re-renders
const MemoizedSudokuGame = memo(SudokuGame);
const MemoizedSlideTilesGame = memo(SlideTilesGame);
const MemoizedFlowFreeGame = memo(FlowFreeGame);
const MemoizedWaterFlowGame = memo(WaterFlowGame);
const MemoizedCrosswordGame = memo(CrosswordGame);
const MemoizedWordSearchGame = memo(WordSearchGame);
const MemoizedSpotDifferenceGame = memo(SpotDifferenceGame);
const MemoizedMatchstickGame = memo(MatchstickGame);

// Add type for ExtendedSlideTilesSettings
type ExtendedSlideTilesSettings = SlideTilesSettings & {
  timer: boolean;
  completionRate: boolean;
  lightningMode: boolean;
  showScore: boolean;
};

const getGameTitle = (
  gameType: GameType,
  t?: (key: string) => string
): string => {
  switch (gameType) {
    case GameType.SUDOKU:
      return t ? t("sudoku") : "Sudoku";
    case GameType.SLIDE_TILES:
      return t ? t("slideTiles") : "Slide Tiles";
    case GameType.FLOW_FREE:
      return t ? t("flowFree") : "Flow Free";
    case GameType.WORDSEARCH:
      return t ? t("wordSearch") : "Word Search";
    case GameType.CROSSWORD:
      return t ? t("crossword") : "Crossword";
    case GameType.WATER_FLOW:
      return t ? t("waterFlow") : "Water Flow";
    case GameType.MATCHSTICK:
      return t ? t("matchstick") : "Matchstick";
    case GameType.SPOT_DIFFERENCE:
      return t ? t("spotDifference") : "Spot Difference";
    default:
      return t ? t("game") : "Game";
  }
};

// Move these outside the component so they are accessible
const settingsMap = {
  [GameType.SUDOKU]: (settings: any) => settings as SudokuSettings,
  [GameType.SLIDE_TILES]: (settings: any) =>
    settings as SlideTilesSettings & ExtendedSlideTilesSettings,
  [GameType.FLOW_FREE]: (settings: any) => settings as FlowFreeSettings,
  [GameType.WORDSEARCH]: (settings: any) => settings as WordSearchSettings,
  [GameType.CROSSWORD]: (settings: any) => settings as CrosswordSettings,
  [GameType.WATER_FLOW]: (settings: any) => settings as WaterFlowSettings,
  [GameType.MATCHSTICK]: (settings: any) => settings as MatchstickSettings,
  [GameType.SPOT_DIFFERENCE]: (settings: any) =>
    settings as SpotDifferenceSettings,
} as const;
function isSupportedGameType(type: GameType): type is keyof typeof settingsMap {
  return Object.keys(settingsMap).includes(type);
}

const GameScreen: React.FC<GameScreenProps> = ({ route, navigation }) => {
  const { gameType, difficulty } = route.params;
  const { baseSettings, gameSettings } = useSettings();
  const { currentTheme } = useTheme();
  const { playSound } = useSound();
  const {
    timer,
    start,
    pause,
    resume,
    stop,
    reset,
    isRunning,
    isPaused: timerIsPaused,
  } = useTimer();
  const windowDimensions = useWindowDimensions();
  const isLandscape = windowDimensions.width > windowDimensions.height;
  const { t, locale } = useLocalization();
  const [skipRestoreOnMount, setSkipRestoreOnMount] = useState(false);

  // Consolidate game state into a single object
  const [gameState, setGameState] = useState({
    isGameCompleted: false,
    isPaused: false,
    showExitDialog: false,
    showResetDialog: false,
    moves: 0,
    mistakes: 0,
    score: 0,
    previousScore: 0,
  });

  // Ref for SudokuGame
  const sudokuGameRef = useRef<SudokuGameHandle>(null);

  // Sync timer state with game state
  useEffect(() => {
    if (gameState.isPaused && !timerIsPaused) {
      pause();
    } else if (
      !gameState.isPaused &&
      timerIsPaused &&
      !gameState.isGameCompleted
    ) {
      resume();
    }
  }, [
    gameState.isPaused,
    timerIsPaused,
    gameState.isGameCompleted,
    pause,
    resume,
  ]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && gameState.isPaused) {
        handleResume();
      } else if (nextAppState === "background" && !gameState.isPaused) {
        handlePause();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [gameState.isPaused]);

  // Handle navigation focus/blur
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", () => {
      if (gameState.isPaused) {
        handleResume();
      }
    });

    const unsubscribeBlur = navigation.addListener("blur", () => {
      if (!gameState.isPaused) {
        handlePause();
      }
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, gameState.isPaused]);

  // Handle dialog visibility changes
  useEffect(() => {
    if (gameState.showExitDialog || gameState.showResetDialog) {
      handlePause();
    }
  }, [gameState.showExitDialog, gameState.showResetDialog]);

  const handleExitGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, showExitDialog: true }));
  }, []);

  const handleCancelExit = useCallback(() => {
    handleResume();
    setGameState((prev) => ({ ...prev, showExitDialog: false }));
  }, []);

  const handleConfirmExit = useCallback(() => {
    setGameState((prev) => ({ ...prev, showExitDialog: false }));
    stop();
    setTimeout(() => {
      navigation.goBack();
    }, 100);
  }, [navigation, stop]);

  const handleReset = useCallback(() => {
    setGameState((prev) => ({ ...prev, showResetDialog: true }));
  }, []);

  const handleRestart = useCallback(() => {
    if (gameType === GameType.SUDOKU && sudokuGameRef.current) {
      sudokuGameRef.current.restart();
      handleResume();
    }
  }, [gameType]);

  const handleCancelReset = useCallback(() => {
    handleResume();
    setGameState((prev) => ({ ...prev, showResetDialog: false }));
  }, []);

  const handleConfirmReset = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      moves: 0,
      mistakes: 0,
      score: 0,
      previousScore: 0,
      showResetDialog: false,
    }));
    reset();
    start();
    handleResume();
  }, [start, reset]);

  const handleMove = useCallback(() => {
    setGameState((prev) => ({ ...prev, moves: prev.moves + 1 }));
    if (baseSettings.audioEffect) {
      playSound("move");
    }
  }, [baseSettings.audioEffect, playSound]);

  const handleComplete = useCallback(() => {
    setGameState((prev) => ({ ...prev, isGameCompleted: true }));
    stop();
    if (baseSettings.audioEffect) {
      playSound("win");
    }
    if (baseSettings.vibration) {
      Vibration.vibrate([0, 100, 50, 100]);
    }
  }, [baseSettings, stop, playSound]);

  const handlePause = useCallback(() => {
    if (!gameState.isPaused) {
      setGameState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [gameState.isPaused]);

  const handleResume = useCallback(() => {
    if (gameState.isPaused && !gameState.isGameCompleted) {
      setGameState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [gameState.isPaused, gameState.isGameCompleted]);

  // Memoize back handler
  const backAction = useCallback(() => {
    if (gameState.isGameCompleted) {
      navigation.goBack();
      return true;
    }
    handleExitGame();
    return true;
  }, [gameState.isGameCompleted, navigation, handleExitGame]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [backAction]);

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      setSkipRestoreOnMount(true);
      handlePause();
      navigation.replace("Game", {
        gameType,
        difficulty: newDifficulty,
      });
    },
    [navigation, gameType]
  );

  const gameProps = useMemo(() => {
    if (!isSupportedGameType(gameType)) return undefined;
    const baseProps = {
      title: t(getGameTitle(gameType, t)),
      subtitle: t(difficulty.toLowerCase()),
      difficulty,
      onMove: handleMove,
      onComplete: handleComplete,
      orientation: isLandscape ? "landscape" : "portrait",
      isPaused: gameState.isPaused,
      isGameCompleted: gameState.isGameCompleted,
    };
    switch (gameType) {
      case GameType.SUDOKU:
        return {
          ...baseProps,
          settings: settingsMap[GameType.SUDOKU](gameSettings[GameType.SUDOKU]),
          onDifficultyChange: handleDifficultyChange,
          skipRestoreOnMount: skipRestoreOnMount,
          onPause: handlePause,
          onResume: handleResume,
          navigation,
        } as SudokuGameProps;
      case GameType.SLIDE_TILES:
        return {
          ...baseProps,
          settings: settingsMap[GameType.SLIDE_TILES](
            gameSettings[GameType.SLIDE_TILES]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as SlideTilesGameProps;
      case GameType.FLOW_FREE:
        return {
          ...baseProps,
          settings: settingsMap[GameType.FLOW_FREE](
            gameSettings[GameType.FLOW_FREE]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as FlowFreeGameProps;
      case GameType.WORDSEARCH:
        return {
          ...baseProps,
          settings: settingsMap[GameType.WORDSEARCH](
            gameSettings[GameType.WORDSEARCH]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as WordSearchGameProps;
      case GameType.CROSSWORD:
        return {
          ...baseProps,
          settings: settingsMap[GameType.CROSSWORD](
            gameSettings[GameType.CROSSWORD]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as CrosswordGameProps;
      case GameType.WATER_FLOW:
        return {
          ...baseProps,
          settings: settingsMap[GameType.WATER_FLOW](
            gameSettings[GameType.WATER_FLOW]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as WaterFlowGameProps;
      case GameType.MATCHSTICK:
        return {
          ...baseProps,
          settings: settingsMap[GameType.MATCHSTICK](
            gameSettings[GameType.MATCHSTICK]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as MatchstickGameProps;
      case GameType.SPOT_DIFFERENCE:
        return {
          ...baseProps,
          settings: settingsMap[GameType.SPOT_DIFFERENCE](
            gameSettings[GameType.SPOT_DIFFERENCE]
          ),
          onDifficultyChange: handleDifficultyChange,
        } as SpotDifferenceGameProps;
      default:
        return undefined;
    }
  }, [
    gameType,
    t,
    difficulty,
    handleMove,
    handleComplete,
    isLandscape,
    gameSettings,
    gameState.isPaused,
    gameState.isGameCompleted,
    handleDifficultyChange,
    skipRestoreOnMount,
    handlePause,
    handleResume,
  ]);

  // Memoize header props
  const headerProps = useMemo(
    () => ({
      title: t(getGameTitle(gameType, t)),
      subtitle: t(difficulty.toLowerCase()),
      showBackButton: true,
      onBack: handleExitGame,
      showSettings: true,
      onReset: handleReset,
      onRestart: handleRestart,
      onPause: handlePause,
      onResume: handleResume,
      isPaused: gameState.isPaused,
      settings: { ...baseSettings, timer: true },
      isGameCompleted: gameState.isGameCompleted,
      navigation,
      isThemeSelectorVisible: true,
    }),
    [
      gameType,
      handleExitGame,
      handleReset,
      handlePause,
      handleResume,
      gameState.isPaused,
      baseSettings,
      gameState.isGameCompleted,
      navigation,
      t,
      locale,
      difficulty,
      handleRestart,
    ]
  );

  // Render game component based on type
  const renderGame = () => {
    if (!gameProps) return null;
    switch (gameType) {
      case GameType.SUDOKU: {
        const { title, subtitle, ...rest } = gameProps as SudokuGameProps;
        return (
          <SudokuGame
            ref={sudokuGameRef}
            title={title}
            subtitle={subtitle}
            {...rest}
          />
        );
      }
      case GameType.SLIDE_TILES:
        return (
          <MemoizedSlideTilesGame {...(gameProps as SlideTilesGameProps)} />
        );
      case GameType.FLOW_FREE:
        return <MemoizedFlowFreeGame {...(gameProps as FlowFreeGameProps)} />;
      case GameType.WORDSEARCH:
        return (
          <MemoizedWordSearchGame {...(gameProps as WordSearchGameProps)} />
        );
      case GameType.CROSSWORD:
        return <MemoizedCrosswordGame {...(gameProps as CrosswordGameProps)} />;
      case GameType.WATER_FLOW:
        return <MemoizedWaterFlowGame {...(gameProps as WaterFlowGameProps)} />;
      case GameType.MATCHSTICK:
        return (
          <MemoizedMatchstickGame {...(gameProps as MatchstickGameProps)} />
        );
      case GameType.SPOT_DIFFERENCE:
        return (
          <MemoizedSpotDifferenceGame
            {...(gameProps as SpotDifferenceGameProps)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <Header {...headerProps} />
      {renderGame()}
      <Dialog
        visible={gameState.showExitDialog}
        title={t("exit_game")}
        message={t("exit_game_message")}
        buttons={[
          { text: t("cancel"), onPress: handleCancelExit, style: "cancel" },
          { text: t("exit"), onPress: handleConfirmExit, style: "destructive" },
        ]}
        onDismiss={handleCancelExit}
      />
      <Dialog
        visible={gameState.showResetDialog}
        title={t("reset_game")}
        message={t("reset_game_message")}
        buttons={[
          { text: t("cancel"), onPress: handleCancelReset, style: "cancel" },
          {
            text: t("reset"),
            onPress: handleConfirmReset,
            style: "destructive",
          },
        ]}
        onDismiss={handleCancelReset}
      />
    </View>
  );
};

// Memoize styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(GameScreen);
