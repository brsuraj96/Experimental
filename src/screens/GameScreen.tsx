import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  Vibration,
  AppState,
  AppStateStatus,
  useWindowDimensions,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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
import SudokuGame from "../components/games/sudoku/SudokuGame";
import SlideTilesGame from "../components/games/slideTiles/SlideTilesGame";
import FlowFreeGame from "../components/games/flowFree/FlowFreeGame";
import WaterFlowGame from "../components/games/waterFlow/WaterFlowGame";
import CrosswordGame from "../components/games/crossword/CrosswordGame";
import WordSearchGame from "../components/games/wordSearch/WordSearchGame";
import SpotDifferenceGame from "../components/games/spotDifference/SpotDifferenceGame";
import MatchstickGame from "../components/games/matchstick/MatchstickGame";
import { useTimer } from "../context/TimerContext";

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

const GameScreen: React.FC<GameScreenProps> = ({ route, navigation }) => {
  const { gameType, difficulty } = route.params;
  const { baseSettings, gameSettings } = useSettings();
  const { currentTheme } = useTheme();
  const { playSound } = useSound();
  const { timer, start, pause, resume, stop, reset } = useTimer();
  const windowDimensions = useWindowDimensions();
  const isLandscape = windowDimensions.width > windowDimensions.height;

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

  // Memoize handlers to prevent recreation
  const handleExitGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, showExitDialog: true }));
  }, []);

  const handleCancelExit = useCallback(() => {
    setGameState((prev) => ({ ...prev, showExitDialog: false }));
  }, []);

  const handleConfirmExit = useCallback(() => {
    setGameState((prev) => ({ ...prev, showExitDialog: false }));
    stop();
    // Use setTimeout to ensure dialog is closed before navigation
    setTimeout(() => {
      navigation.goBack();
    }, 100);
  }, [navigation, stop]);

  const handleReset = useCallback(() => {
    setGameState((prev) => ({ ...prev, showResetDialog: true }));
  }, []);

  const handleCancelReset = useCallback(() => {
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
    setGameState((prev) => ({ ...prev, isPaused: true }));
    pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
    resume();
  }, [resume]);

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
  }, [gameState.isPaused, handlePause, handleResume]);

  // Memoize base game props
  const baseGameProps = useMemo(
    () => ({
      difficulty,
      onMove: handleMove,
      onComplete: handleComplete,
      orientation: isLandscape ? "landscape" : "portrait",
      isGameCompleted: gameState.isGameCompleted,
      isPaused: gameState.isPaused,
    }),
    [
      difficulty,
      handleMove,
      handleComplete,
      isLandscape,
      gameState.isGameCompleted,
      gameState.isPaused,
    ]
  );

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      navigation.replace("Game", {
        gameType,
        difficulty: newDifficulty,
      });
    },
    [navigation, gameType]
  );

  const gameProps = useMemo(() => {
    switch (gameType) {
      case GameType.SUDOKU:
        return {
          ...baseGameProps,
          settings: gameSettings[GameType.SUDOKU],
          onDifficultyChange: handleDifficultyChange,
        } as SudokuGameProps;
      case GameType.SLIDE_TILES:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.SLIDE_TILES],
            timer: true,
            completionRate: true,
            lightningMode: false,
            showScore: true,
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as SlideTilesGameProps;
      case GameType.FLOW_FREE:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.FLOW_FREE],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as FlowFreeGameProps;
      case GameType.WORDSEARCH:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.WORDSEARCH],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as WordSearchGameProps;
      case GameType.CROSSWORD:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.CROSSWORD],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as CrosswordGameProps;
      case GameType.WATER_FLOW:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.WATER_FLOW],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as WaterFlowGameProps;
      case GameType.MATCHSTICK:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.MATCHSTICK],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as MatchstickGameProps;
      case GameType.SPOT_DIFFERENCE:
        return {
          ...baseGameProps,
          settings: {
            ...gameSettings[GameType.SPOT_DIFFERENCE],
            showTimer: true,
            allowUndo: true,
            allowRedo: true,
          },
          onDifficultyChange: handleDifficultyChange,
        } as SpotDifferenceGameProps;
      default:
        return baseGameProps;
    }
  }, [baseGameProps, gameType, gameSettings, handleDifficultyChange]);

  // Memoize header props
  const headerProps = useMemo(
    () => ({
      title: gameType,
      showBackButton: true,
      onBack: handleExitGame,
      showSettings: true,
      onReset: handleReset,
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
    ]
  );

  // Render game component based on type
  const renderGame = () => {
    switch (gameType) {
      case GameType.SUDOKU:
        return <MemoizedSudokuGame {...(gameProps as SudokuGameProps)} />;
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
        title="Exit Game"
        message="Are you sure you want to exit the game? Your progress will be saved."
        buttons={[
          { text: "Cancel", onPress: handleCancelExit, style: "cancel" },
          { text: "Exit", onPress: handleConfirmExit, style: "destructive" },
        ]}
        onDismiss={handleCancelExit}
      />
      <Dialog
        visible={gameState.showResetDialog}
        title="Reset Game"
        message="Are you sure you want to reset? Your progress will be saved."
        buttons={[
          { text: "Cancel", onPress: handleCancelReset, style: "cancel" },
          { text: "Reset", onPress: handleConfirmReset, style: "destructive" },
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
