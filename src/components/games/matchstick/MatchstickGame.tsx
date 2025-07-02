import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { Difficulty, MatchstickLevel, Matchstick } from "../../../types";
import { theme } from "../../../styles/theme";
import { useSound } from "../../../hooks/useSound";
import MatchstickBoard from "./MatchstickBoard";
import MatchstickControls from "./MatchstickControls";
import { generateMatchstickLevel } from "./matchstickGenerator";
import i18n from "../../../locales/i18n";

interface MatchstickGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: (moves: number) => void;
}

const MatchstickGame: React.FC<MatchstickGameProps> = ({
  difficulty,
  onMove,
  onComplete,
}) => {
  const [level, setLevel] = useState<MatchstickLevel | null>(null);
  const [selectedMatchstick, setSelectedMatchstick] =
    useState<Matchstick | null>(null);
  const [moves, setMoves] = useState(0);
  const { playSound } = useSound();

  // Generate a new level when difficulty changes
  useEffect(() => {
    const newLevel = generateMatchstickLevel(difficulty);
    setLevel(newLevel);
    setSelectedMatchstick(null);
    setMoves(0);
  }, [difficulty]);

  // Handle matchstick selection
  const handleSelectMatchstick = useCallback(
    (matchstick: Matchstick) => {
      if (!level) return;

      if (!matchstick.isMovable) {
        playSound("error");
        return;
      }

      if (selectedMatchstick && selectedMatchstick.id === matchstick.id) {
        // Deselect if already selected
        setSelectedMatchstick(null);
      } else {
        // Select new matchstick
        const newMatchsticks = level.puzzle.matchsticks.map((m) => ({
          ...m,
          isSelected: m.id === matchstick.id,
        }));

        setLevel({
          ...level,
          puzzle: {
            ...level.puzzle,
            matchsticks: newMatchsticks,
          },
        });

        setSelectedMatchstick(matchstick);
        playSound("click");
      }
    },
    [level, selectedMatchstick, playSound]
  );

  // Handle matchstick movement
  const handleMoveMatchstick = useCallback(
    (dx: number, dy: number) => {
      if (!level || !selectedMatchstick) return;

      // Update the position of the selected matchstick
      const updatedMatchsticks = level.puzzle.matchsticks.map((m) => {
        if (m.id === selectedMatchstick.id) {
          return {
            ...m,
            x1: m.x1 + dx,
            y1: m.y1 + dy,
            x2: m.x2 + dx,
            y2: m.y2 + dy,
            isPlaced: true,
          };
        }
        return m;
      });

      // Update the equation based on new matchstick positions
      const currentEquation = calculateEquation(updatedMatchsticks);

      setLevel({
        ...level,
        puzzle: {
          ...level.puzzle,
          matchsticks: updatedMatchsticks,
          currentEquation,
        },
      });

      setMoves((prev) => prev + 1);
      onMove();
      playSound("move");

      // Check if the equation is now correct
      if (currentEquation === level.puzzle.targetEquation) {
        playSound("win");
        onComplete(moves + 1);
      }
    },
    [level, selectedMatchstick, moves, onMove, onComplete, playSound]
  );

  // Handle showing a hint
  const handleHint = useCallback(() => {
    if (!level) return;

    Alert.alert(i18n.t("hint"), level.hint);
  }, [level]);

  // Handle rotation of the selected matchstick
  const handleRotate = useCallback(
    (clockwise: boolean) => {
      if (!level || !selectedMatchstick) return;

      // Calculate center point of the matchstick
      const centerX = (selectedMatchstick.x1 + selectedMatchstick.x2) / 2;
      const centerY = (selectedMatchstick.y1 + selectedMatchstick.y2) / 2;

      // Calculate current angle
      const currentAngle = Math.atan2(
        selectedMatchstick.y2 - selectedMatchstick.y1,
        selectedMatchstick.x2 - selectedMatchstick.x1
      );

      // Rotate by 45 degrees (π/4 radians)
      const rotationAmount = clockwise ? Math.PI / 4 : -Math.PI / 4;
      const newAngle = currentAngle + rotationAmount;

      // Calculate the length of the matchstick
      const length = Math.sqrt(
        Math.pow(selectedMatchstick.x2 - selectedMatchstick.x1, 2) +
          Math.pow(selectedMatchstick.y2 - selectedMatchstick.y1, 2)
      );

      // Calculate new endpoints
      const newX1 = centerX - (Math.cos(newAngle) * length) / 2;
      const newY1 = centerY - (Math.sin(newAngle) * length) / 2;
      const newX2 = centerX + (Math.cos(newAngle) * length) / 2;
      const newY2 = centerY + (Math.sin(newAngle) * length) / 2;

      // Update the matchstick
      const updatedMatchsticks = level.puzzle.matchsticks.map((m) => {
        if (m.id === selectedMatchstick.id) {
          return {
            ...m,
            x1: newX1,
            y1: newY1,
            x2: newX2,
            y2: newY2,
            isPlaced: true,
          };
        }
        return m;
      });

      // Update the equation
      const currentEquation = calculateEquation(updatedMatchsticks);

      setLevel({
        ...level,
        puzzle: {
          ...level.puzzle,
          matchsticks: updatedMatchsticks,
          currentEquation,
        },
      });

      setMoves((prev) => prev + 1);
      onMove();
      playSound("move");

      // Check if the equation is now correct
      if (currentEquation === level.puzzle.targetEquation) {
        playSound("win");
        onComplete(moves + 1);
      }
    },
    [level, selectedMatchstick, moves, onMove, onComplete, playSound]
  );

  if (!level) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>{level.puzzle.currentEquation}</Text>
        <Text style={styles.targetText}>
          Target: {level.puzzle.targetEquation}
        </Text>
      </View>

      <MatchstickBoard
        matchsticks={level.puzzle.matchsticks}
        onSelectMatchstick={handleSelectMatchstick}
      />

      <MatchstickControls
        onMove={handleMoveMatchstick}
        onRotate={handleRotate}
        onHint={handleHint}
        isMatchstickSelected={!!selectedMatchstick}
      />

      <Text style={styles.instructionText}>
        Move and rotate the matchsticks to form the target equation
      </Text>
    </View>
  );
};

// Helper function to calculate the current equation based on matchstick positions
const calculateEquation = (matchsticks: Matchstick[]): string => {
  // This is a simplified version and would need more sophisticated implementation
  // in a real app to recognize numbers and symbols from matchstick positions

  // For demo purposes, we'll just return a placeholder
  const placedCount = matchsticks.filter((m) => m.isPlaced).length;

  // Example logic - this would need to be much more sophisticated in reality
  if (placedCount === 0) return "1+2=3";
  if (placedCount === 1) return "1-2=1";
  if (placedCount === 2) return "7-2=5";
  if (placedCount === 3) return "7+1=8";
  if (placedCount >= 4) return "4+4=8";

  return "1+2=3";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  equationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 10,
    width: "100%",
  },
  equationText: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.text,
    letterSpacing: 8,
  },
  targetText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default MatchstickGame;
