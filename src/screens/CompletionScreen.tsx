import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  BackHandler,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, GameType, Difficulty } from "../types";
import { theme } from "../styles/theme";
import Confetti from "../components/common/Confetti";
import { useGameContext } from "../context/GameContext";
import useSound from "../hooks/useSound";
import IconSudoku from "../assets/icons/IconSudoku";
import IconSlideTiles from "../assets/icons/IconSlideTiles";
import IconFlowFree from "../assets/icons/IconFlowFree";

type CompletionScreenRouteProp = RouteProp<RootStackParamList, "Completion">;
type CompletionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Completion"
>;

const CompletionScreen = () => {
  const route = useRoute<CompletionScreenRouteProp>();
  const navigation = useNavigation<CompletionScreenNavigationProp>();
  const { gameType, difficulty, time, moves } = route.params;
  const { updateProgress, getNextLevel } = useGameContext();
  const { playSound } = useSound();

  useEffect(() => {
    // Update game progress when the screen loads
    updateProgress(gameType, difficulty);

    // Prevent back button from going to the game screen
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate("Home");
        return true;
      }
    );

    playSound("win");

    return () => backHandler.remove();
  }, [gameType, difficulty, updateProgress, navigation, playSound]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed ${gameType} (${difficulty}) in ${formatTime(
          time
        )} with ${moves} moves in Puzzle World! Can you beat that?`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePlayAgain = () => {
    navigation.navigate("Game", { gameType, difficulty });
  };

  const handleNextLevel = () => {
    const nextLevel = getNextLevel(gameType, difficulty);
    navigation.navigate("Game", { gameType, difficulty: nextLevel });
  };

  const handleHome = () => {
    navigation.navigate("Home");
  };

  const renderGameIcon = () => {
    switch (gameType) {
      case GameType.SUDOKU:
        return <IconSudoku size={80} />;
      case GameType.SLIDE_TILES:
        return <IconSlideTiles size={80} />;
      case GameType.FLOW_FREE:
        return <IconFlowFree size={80} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Confetti />

      <View style={styles.content}>
        <View style={styles.iconContainer}>{renderGameIcon()}</View>

        <Text style={styles.title}>Puzzle Completed!</Text>
        <Text style={styles.gameInfo}>
          {gameType} - {difficulty}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatTime(time)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNextLevel}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Next Level
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleHome}>
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  content: {
    width: "80%",
    maxWidth: 400,
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 20,
    padding: theme.spacing.large,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    textAlign: "center",
  },
  gameInfo: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: theme.spacing.large,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  buttonsContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.white,
  },
});

export default CompletionScreen;
