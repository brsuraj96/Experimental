import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Vibration,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType, Difficulty } from "../types";
import { theme } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import Header from "../components/common/Header";
import SudokuGame from "../components/games/sudoku/SudokuGame";
import SlideTilesGame from "../components/games/slideTiles/SlideTilesGame";
import FlowFreeGame from "../components/games/flowFree/FlowFreeGame";
import WaterFlowGame from "../components/games/waterFlow/WaterFlowGame";
import CrosswordGame from "../components/games/crossword/CrosswordGame";
import WordSearchGame from "../components/games/wordSearch/WordSearchGame";
import SpotDifferenceGame from "../components/games/spotDifference/SpotDifferenceGame";
import MatchstickGame from "../components/games/matchstick/MatchstickGame";
import useOrientation from "../hooks/useOrientation";
import useSound from "../hooks/useSound";

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

  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [moves, setMoves] = useState<number>(0);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentTheme } = useTheme();

  const isLandscape = orientation === "landscape";

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit Game",
        "Are you sure you want to exit? Your progress will be lost.",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Exit", onPress: () => navigation.goBack() },
        ]
      );
      return true;
    };

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
    if (settings.audioEffect) {
      playSound("click");
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (settings.audioEffect) {
      playSound("click");
    }
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
            startTime={gameStartTime}
            isGameCompleted={isGameCompleted}
            onDifficultyChange={(newDifficulty: Difficulty) => {
              setDifficulty(newDifficulty);
              setGameStartTime(Date.now());
              setIsGameCompleted(false);
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
          if (settings.audioEffect) {
            playSound("click");
          }
          if (settings.vibration) {
            Vibration.vibrate(50);
          }
          Alert.alert(
            "Exit Game",
            "Are you sure you want to exit? Your progress will be lost.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Exit",
                onPress: () => {
                  if (settings.audioEffect) {
                    playSound("click");
                  }
                  navigation.goBack();
                },
              },
            ]
          );
        }}
        onReset={resetGame}
        onPause={handlePause}
        onResume={handleResume}
        isPaused={isPaused}
        containerStyle={{
          height: isLandscape ? 60 : 72,
          paddingVertical: isLandscape ? 4 : 10,
        }}
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
    opacity: 0.3,
  },
});

export default GameScreen;
