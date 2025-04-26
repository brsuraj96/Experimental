import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Difficulty } from "../../../types";
import Timer from "../../common/Timer";
import CustomDropdown from "../../common/CustomDropdown";
import { theme } from "../../../styles/theme";

interface GameHeaderProps {
  mistakes: number;
  difficulty: Difficulty;
  time: number;
  startTime: number;
  isGameCompleted: boolean;
  showDifficultySelector?: boolean;
  onDifficultyChange?: (difficulty: Difficulty) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  mistakes,
  difficulty,
  time,
  startTime,
  isGameCompleted,
  showDifficultySelector = false,
  onDifficultyChange,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const difficulties: Difficulty[] = [
    Difficulty.BEGINNER,
    Difficulty.EASY,
    Difficulty.MEDIUM,
    Difficulty.HARD,
    Difficulty.EXPERT,
  ];

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (onDifficultyChange) {
      onDifficultyChange(newDifficulty);
    }
  };

  const difficultyOptions = difficulties.map((diff) => ({
    value: diff,
    label: diff,
  }));

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.stat,
          {
            display: "flex",
            flexDirection: "row",
            gap: 4,
          },
        ]}
      >
        <Text style={styles.label}>Mistakes:</Text>
        <Text style={styles.value}>{mistakes}</Text>
      </View>
      <View style={styles.stat}>
        {showDifficultySelector ? (
          <View style={styles.dropdownContainer}>
            <CustomDropdown
              data={difficultyOptions}
              onChange={({ value }) =>
                handleDifficultyChange(value as Difficulty)
              }
              placeholder={difficulty}
            />
          </View>
        ) : (
          <Text style={styles.value}>{difficulty}</Text>
        )}
      </View>
      <View style={styles.stat}>
        <Timer startTime={startTime} isRunning={!isGameCompleted} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.small,
    width: "100%",
  },
  stat: {
    alignItems: "center",
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  value: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownContainer: {
    minWidth: 80,
    marginTop: 2,
    height: 32,
  },
});

export default GameHeader;
