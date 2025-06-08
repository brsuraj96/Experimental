import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  Vibration,
  AppState,
  AppStateStatus,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType, Difficulty } from "../types";
import { theme } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import useOrientation from "../hooks/useOrientation";
import useSound from "../hooks/useSound";
import Header from "../components/common/Header";
import SudokuGame from "../components/games/sudoku/SudokuGame";
import SlideTilesGame from "../components/games/slideTiles/SlideTilesGame";
import FlowFreeGame from "../components/games/flowFree/FlowFreeGame";
import WaterFlowGame from "../components/games/waterFlow/WaterFlowGame";
import CrosswordGame from "../components/games/crossword/CrosswordGame";
import WordSearchGame from "../components/games/wordSearch/WordSearchGame";
import SpotDifferenceGame from "../components/games/spotDifference/SpotDifferenceGame";
import MatchstickGame from "../components/games/matchstick/MatchstickGame";
import Dialog from "../components/common/Dialog"; // Import the custom Dialog component

type GameScreenRouteProp = RouteProp<RootStackParamList, "Game">;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, "Game">;

const GameScreen = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { gameType, difficulty: initialDifficulty } = route.params;
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const orientation = useOrientation();
  const { playSound } = useSound();
  const { settings } = useSettings();
  const { currentTheme } = useTheme();
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const isLandscape = orientation === "landscape";

  const handleExitGame = () => {
    setShowExitDialog(false);
    navigation.goBack();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
    handleResume();
  };

  const backAction = () => {
    handlePause();
    setShowExitDialog(true);
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (isGameCompleted) {
      if (settings.audioEffect) {
        playSound("win");
      }

      if (settings.vibration) {
        // Longer vibration for win
        Vibration.vibrate([0, 100, 100, 100, 100, 100]);
      }

      const endTime = Date.now();
      const timeTaken = Math.floor((endTime - gameStartTime) / 1000);

      setTimeout(() => {
        navigation.navigate("Completion", {
          gameType,
          difficulty,
          time: timeTaken,
          moves,
        });
      }, 1500);
    }
  }, [
    isGameCompleted,
    navigation,
    gameType,
    difficulty,
    gameStartTime,
    moves,
    playSound,
    settings.audioEffect,
    settings.vibration,
  ]);

  // Add AppState monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "inactive" || nextAppState === "background") {
          handlePause();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAddMove = () => {
    setMoves((prev) => prev + 1);
    if (settings.audioEffect) {
      playSound("move");
    }
    if (settings.vibration) {
      Vibration.vibrate(50);
    }
  };

  const resetGame = () => {
    setMoves(0);
    setGameStartTime(Date.now());
    setIsGameCompleted(false);
    if (settings.audioEffect) {
      playSound("click");
    }
    navigation.replace("Game", {
      gameType,
      difficulty,
    });
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const renderGame = () => {
    // Common props for all games
    const gameProps = {
      difficulty,
      onMove: handleAddMove,
      onComplete: () => setIsGameCompleted(true),
      orientation,
      settings,
      isPaused,
    };

    switch (gameType) {
      case GameType.SUDOKU:
        return (
          <SudokuGame
            {...gameProps}
            isGameCompleted={isGameCompleted}
            onDifficultyChange={(newDifficulty) => {
              setDifficulty(newDifficulty);
              setGameStartTime(Date.now()); // Reset start time for new difficulty
              setIsGameCompleted(false);
              setMoves(0);
            }}
          />
        );
      case GameType.SLIDE_TILES:
        return <SlideTilesGame {...gameProps} />;
      case GameType.FLOW_FREE:
        return <FlowFreeGame {...gameProps} />;
      case GameType.WATER_FLOW:
        return <WaterFlowGame {...gameProps} />;
      case GameType.CROSSWORD:
        return <CrosswordGame {...gameProps} />;
      case GameType.SPOT_DIFFERENCE:
        return <SpotDifferenceGame {...gameProps} />;
      case GameType.MATCHSTICK:
        return <MatchstickGame {...gameProps} />;
      case GameType.WORDSEARCH: // Used as placeholder for WordSearch since it's not in the enum
        return <WordSearchGame {...gameProps} />;
      default:
        return <View />;
    }
  };
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <Header
        title={gameType}
        subtitle={difficulty}
        showBackButton
        onBack={() => {
          backAction(); // Show exit confirmation dialog
          if (settings.audioEffect) {
            playSound("click");
          }
          if (settings.vibration) {
            Vibration.vibrate(50);
          }
        }}
        onReset={resetGame}
        onPause={handlePause}
        onResume={handleResume}
        isPaused={isPaused}
        settings={settings}
        isGameCompleted={isGameCompleted}
        containerStyle={{
          height: isLandscape ? 60 : 72,
          paddingVertical: isLandscape ? 4 : 10,
        }}
        isThemeSelectorVisible
        showSettings
      />

      <View
        style={[
          styles.gameContainer,
          isLandscape ? styles.landscapeContainer : styles.portraitContainer,
          isPaused && styles.blurContainer,
        ]}
      >
        {renderGame()}
      </View>

      {/* Exit confirmation dialog */}
      <Dialog
        visible={showExitDialog}
        title="Exit Game"
        message="Are you sure you want to exit? Your progress will be lost."
        buttons={[
          {
            text: "Cancel",
            onPress: handleCancelExit,
            style: "cancel",
          },
          {
            text: "Exit",
            onPress: handleExitGame,
            style: "destructive",
          },
        ]}
        onDismiss={handleCancelExit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.medium,
    minHeight: 0, // Ensures content can shrink below default minimum
    maxHeight: "100%",
  },
  landscapeContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.large,
  },
  portraitContainer: {
    flexDirection: "column",
    paddingVertical: theme.spacing.medium,
  },
  blurContainer: {
    opacity: 0.7,
  },
});

export default GameScreen;
