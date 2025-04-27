import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Difficulty } from "../../../types";
import Timer from "../../common/Timer";
import CustomDropdown from "../../common/CustomDropdown";
import { useTheme } from "../../../context/ThemeContext";

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
  const { currentTheme } = useTheme();

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
    <View style={[styles.container, { padding: currentTheme.spacing.small }]}>
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
              data={difficultyOptions}
              onChange={({ value }) =>
                handleDifficultyChange(value as Difficulty)
              }
              placeholder={difficulty}
            />
          </View>
        ) : (
          <Text style={[styles.value, { color: currentTheme.colors.text }]}>
            {difficulty}
          </Text>
        )}
      </View>
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
    width: "100%",
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
});

export default GameHeader;
