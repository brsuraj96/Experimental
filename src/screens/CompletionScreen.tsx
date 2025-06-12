import React, { useEffect, useCallback, memo, useMemo } from "react";
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
import { useSound } from "../hooks/useSound";
import IconSudoku from "../assets/icons/IconSudoku";
import IconSlideTiles from "../assets/icons/IconSlideTiles";
import IconFlowFree from "../assets/icons/IconFlowFree";

type CompletionScreenRouteProp = RouteProp<RootStackParamList, "Completion">;
type CompletionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Completion"
>;

// Define base styles that don't depend on theme
const baseStyles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
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

// Memoize icon components
const MemoizedIconSudoku = memo(IconSudoku);
const MemoizedIconSlideTiles = memo(IconSlideTiles);
const MemoizedIconFlowFree = memo(IconFlowFree);

// Memoize button component
const ActionButton = memo(
  ({
    onPress,
    text,
    isPrimary = false,
    themeColors,
  }: {
    onPress: () => void;
    text: string;
    isPrimary?: boolean;
    themeColors: typeof theme.colors;
  }) => (
    <TouchableOpacity
      style={[
        baseStyles.button,
        { backgroundColor: themeColors.backgroundLight },
        isPrimary && baseStyles.primaryButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          baseStyles.buttonText,
          { color: themeColors.text },
          isPrimary && baseStyles.primaryButtonText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
);

ActionButton.displayName = "ActionButton";

const CompletionScreen = () => {
  const route = useRoute<CompletionScreenRouteProp>();
  const navigation = useNavigation<CompletionScreenNavigationProp>();
  const { gameType, difficulty, time, moves } = route.params;
  const { updateProgress, getNextLevel } = useGameContext();
  const { playSound } = useSound();

  const formatTime = useCallback((timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `I just completed ${gameType} (${difficulty}) in ${formatTime(
          time
        )} with ${moves} moves in Puzzle World! Can you beat that?`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [gameType, difficulty, time, moves, formatTime]);

  const handlePlayAgain = useCallback(() => {
    navigation.navigate("Game", { gameType, difficulty });
  }, [navigation, gameType, difficulty]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = getNextLevel(gameType, difficulty);
    navigation.navigate("Game", { gameType, difficulty: nextLevel });
  }, [navigation, gameType, difficulty, getNextLevel]);

  const handleHome = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  const renderGameIcon = useCallback(() => {
    const size = 80;
    switch (gameType) {
      case GameType.SUDOKU:
        return <MemoizedIconSudoku size={size} />;
      case GameType.SLIDE_TILES:
        return <MemoizedIconSlideTiles size={size} />;
      case GameType.FLOW_FREE:
        return <MemoizedIconFlowFree size={size} />;
      default:
        return null;
    }
  }, [gameType]);

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

  // Memoize styles to prevent recreation
  const styles = useMemo(
    () =>
      StyleSheet.create({
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
      }),
    []
  );

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
          <ActionButton
            onPress={handleShare}
            text="Share"
            themeColors={theme.colors}
          />
          <ActionButton
            onPress={handlePlayAgain}
            text="Play Again"
            themeColors={theme.colors}
          />
          <ActionButton
            onPress={handleNextLevel}
            text="Next Level"
            isPrimary
            themeColors={theme.colors}
          />
          <ActionButton
            onPress={handleHome}
            text="Home"
            themeColors={theme.colors}
          />
        </View>
      </View>
    </View>
  );
};

export default memo(CompletionScreen);
