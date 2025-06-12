import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Vibration } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Difficulty } from "../../../types";
import Timer from "../../common/Timer";
import CustomDropdown from "../../common/CustomDropdown";
import { useTheme } from "../../../context/ThemeContext";
import { SudokuSettings } from "../../../types/settings";
import { useSound, SoundType } from "../../../hooks/useSound";
import ScorePopup from "../../common/ScorePopup";
import ScoreDisplay from "../sudoku/ScoreDisplay";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../types";
import { GameType } from "../../../types";

// Define DropdownOption locally since it's not exported from CustomDropdown
interface DropdownOption<T> {
  label: string;
  value: T;
}

interface GameHeaderProps {
  mistakes: number;
  difficulty: Difficulty;
  time: number;
  isGameCompleted: boolean;
  showDifficultySelector?: boolean;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  score: number;
  previousScore: number;
  settings: SudokuSettings;
  isPaused?: boolean;
  gameType: GameType;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  mistakes,
  difficulty,
  time,
  isGameCompleted,
  showDifficultySelector,
  onDifficultyChange,
  score,
  previousScore,
  settings,
  isPaused = false,
  gameType,
}) => {
  const { currentTheme } = useTheme();
  const { playSound } = useSound();
  const scoreAnimation = useRef(new Animated.Value(previousScore || 0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [scorePopups, setScorePopups] = useState<
    Array<{ id: number; score: number; x: number; y: number }>
  >([]);
  const popupIdCounter = useRef(0);
  const scoreContainerRef = useRef<View>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Animate score changes
  useEffect(() => {
    if (score !== previousScore && settings.showScore) {
      // Animate the score number
      Animated.spring(scoreAnimation, {
        toValue: score,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Animate the progress bar
      Animated.timing(progressAnimation, {
        toValue: score / 1000, // Normalize to 0-1 range assuming max score of 1000
        duration: 500,
        useNativeDriver: false,
      }).start(); // Play sound effect for score changes if enabled
      if (settings.audioEffect && score > (previousScore || 0)) {
        const scoreDiff = score - (previousScore || 0);
        // Play different sounds for different types of score increases
        if (scoreDiff >= 100) {
          playSound("win" as SoundType);
        } else {
          playSound("move" as SoundType);
        }
      }

      // Add haptic feedback for score changes
      if (settings.vibration) {
        const scoreDiff = score - (previousScore || 0);
        if (scoreDiff >= 100) {
          // Stronger vibration for big score increases
          Vibration.vibrate([0, 100, 50, 100]);
        } else {
          // Gentle vibration for normal score increases
          Vibration.vibrate(50);
        }
      }
    }
  }, [score, previousScore, settings]);

  // Function to show score popup
  const showScorePopup = useCallback((points: number) => {
    if (!scoreContainerRef.current) return;

    scoreContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
      const newPopup = {
        id: popupIdCounter.current++,
        score: points,
        x: width / 2,
        y: height / 2,
      };
      setScorePopups((prev) => [...prev, newPopup]);
    });
  }, []);

  // Show popup for significant score changes
  useEffect(() => {
    if (score > (previousScore || 0)) {
      const scoreDiff = score - (previousScore || 0);
      if (scoreDiff >= 50) {
        showScorePopup(scoreDiff);
      }
    }
  }, [score, previousScore]);

  const handlePopupComplete = useCallback((id: number) => {
    setScorePopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  const difficulties: Difficulty[] = [
    Difficulty.BEGINNER,
    Difficulty.EASY,
    Difficulty.MEDIUM,
    Difficulty.HARD,
    Difficulty.EXPERT,
  ];

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      navigation.replace("Game", {
        gameType,
        difficulty: newDifficulty,
      });
    },
    [navigation, gameType]
  );

  const difficultyOptions: DropdownOption<Difficulty>[] = difficulties.map(
    (diff) => ({
      label: diff,
      value: diff,
    })
  );

  return (
    <View style={[styles.container, { padding: currentTheme.spacing.small }]}>
      {settings.showScore && (
        <View ref={scoreContainerRef} style={styles.scoreContainer}>
          <ScoreDisplay
            score={score}
            previousScore={previousScore}
            maxScore={1000}
          />
          {scorePopups.map((popup) => (
            <ScorePopup
              key={popup.id}
              score={popup.score}
              x={popup.x}
              y={popup.y}
              onComplete={() => handlePopupComplete(popup.id)}
            />
          ))}
        </View>
      )}
      <View style={styles.statRow}>
        <View
          style={[
            styles.stat,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            },
          ]}
        >
          <FontAwesome5
            name="exclamation-circle"
            size={16}
            color={currentTheme.colors.error}
          />
          <Text style={[styles.value, { color: currentTheme.colors.text }]}>
            {": " + mistakes}
          </Text>
        </View>
        <View style={[styles.stat, { marginLeft: 26 }]}>
          {showDifficultySelector ? (
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                value={difficulty}
                options={difficultyOptions}
                onValueChange={onDifficultyChange ?? (() => {})}
              />
            </View>
          ) : (
            <Text style={[styles.value, { color: currentTheme.colors.text }]}>
              {difficulty}
            </Text>
          )}
        </View>
        {settings.timer && (
          <View
            style={[
              styles.stat,
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              },
            ]}
          >
            <Timer isPaused={isPaused} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
    marginTop: 8,
  },
  stat: {
    alignItems: "center",
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    minWidth: 80,
    marginTop: 2,
    height: 32,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});

export default GameHeader;
