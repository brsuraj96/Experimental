import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import { Difficulty } from "../../../types";
import WaterFlowBoard from "./WaterFlowBoard";
import Button from "../../common/Button";
import {
  generateLevel,
  rotatePipe,
  isLevelComplete,
  getConnectedPipes,
  getHint,
} from "./logic";
import { useSound } from "../../../hooks/useSound";
import { theme } from "../../../styles/theme";
import i18n from "../../../locales/i18n";

interface WaterFlowGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
}

const WaterFlowGame: React.FC<WaterFlowGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
}) => {
  const [level, setLevel] = useState(() => generateLevel(difficulty));
  const [board, setBoard] = useState(level.board);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [connectionPulse] = useState(new Animated.Value(0));

  const { playSound } = useSound();

  // Check for level completion
  useEffect(() => {
    if (isLevelComplete(board, level.sourcePosition)) {
      // Mark all connected pipes
      const connectedBoard = getConnectedPipes(board, level.sourcePosition);
      setBoard(connectedBoard);

      // Set game as complete if not already done
      if (!isGameComplete) {
        setIsGameComplete(true);
        playSound("win");
        onComplete();

        // Animate the connected pipes
        Animated.loop(
          Animated.sequence([
            Animated.timing(connectionPulse, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false,
            }),
            Animated.timing(connectionPulse, {
              toValue: 0,
              duration: 800,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }
  }, [
    board,
    level.sourcePosition,
    isGameComplete,
    onComplete,
    playSound,
    connectionPulse,
  ]);

  // Handle cell press to rotate a pipe
  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (isGameComplete) return;

      // Rotate the pipe at this position
      const newBoard = rotatePipe(board, row, col);
      setBoard(newBoard);

      // Update moves count and call onMove callback
      setMovesCount((prev) => prev + 1);
      onMove();
      playSound("move");
    },
    [board, isGameComplete, onMove, playSound]
  );

  // Start a new level
  const handleNewLevel = useCallback(() => {
    const newLevel = generateLevel(difficulty);
    setLevel(newLevel);
    setBoard(newLevel.board);
    setMovesCount(0);
    setIsGameComplete(false);
    connectionPulse.setValue(0);
  }, [difficulty, connectionPulse]);

  // Show a hint by highlighting a pipe that should be rotated
  const handleHint = useCallback(() => {
    if (isGameComplete) return;

    // Get hint
    const hintPosition = getHint(
      board,
      level.sourcePosition,
      level.destinationPosition
    );

    if (hintPosition) {
      playSound("move");

      // Highlight the pipe by temporarily setting it as connected
      const newBoard = [...board];
      const originalPipe = { ...newBoard[hintPosition.row][hintPosition.col] };

      // Set the pipe as highlighted
      newBoard[hintPosition.row][hintPosition.col] = {
        ...originalPipe,
        isConnected: true,
      };

      setBoard(newBoard);

      // Reset the highlighting after a delay
      setTimeout(() => {
        newBoard[hintPosition.row][hintPosition.col] = originalPipe;
        setBoard([...newBoard]);
      }, 1000);
    }
  }, [board, isGameComplete, level, playSound]);

  return (
    <View
      style={[
        styles.container,
        orientation === "landscape" && styles.landscapeContainer,
      ]}
    >
      <View style={styles.gameInfo}>
        <Text style={styles.difficultyText}>
          {i18n.t("difficulty")}: {difficulty}
        </Text>
        <Text style={styles.movesText}>
          {i18n.t("moves")}: {movesCount}
        </Text>
      </View>

      <WaterFlowBoard board={board} onCellPress={handleCellPress} />

      <View
        style={[
          styles.controls,
          orientation === "landscape" && styles.landscapeControls,
        ]}
      >
        <Button
          title={i18n.t("newLevel")}
          onPress={handleNewLevel}
          variant="primary"
          style={styles.button}
        />
        <Button
          title={i18n.t("hint")}
          onPress={handleHint}
          variant="secondary"
          style={styles.button}
          disabled={isGameComplete}
        />
      </View>

      {isGameComplete && (
        <Animated.View
          style={[
            styles.completionMessage,
            {
              opacity: connectionPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ]}
        >
          <Text style={styles.completionText}>{i18n.t("levelComplete")}</Text>
          <Text style={styles.completionSubText}>
            {i18n.t("levelCompleteSubText")} {movesCount} {i18n.t("moves")}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  landscapeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  gameInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textDim,
  },
  movesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textDim,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    width: "100%",
  },
  landscapeControls: {
    flexDirection: "column",
    marginLeft: 24,
    marginTop: 0,
    width: "auto",
  },
  button: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  completionMessage: {
    position: "absolute",
    padding: 16,
    backgroundColor: theme.colors.overlay,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completionText: {
    color: theme.colors.success,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  completionSubText: {
    color: theme.colors.text,
    fontSize: 16,
  },
});

export default WaterFlowGame;
