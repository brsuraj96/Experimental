import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Difficulty, FlowLevel, FlowBoard, FlowColor } from "../../../types";
import FlowFreeBoard from "./FlowFreeBoard";
import {
  generateLevel,
  isLevelComplete,
  addConnection,
  clearConnections,
} from "./logic";
import { theme } from "../../../styles/theme";
import { useSound } from "../../../hooks/useSound";

interface FlowFreeGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
}

const FlowFreeGame: React.FC<FlowFreeGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
}) => {
  const { playSound } = useSound();
  const [level, setLevel] = useState<FlowLevel>(() =>
    generateLevel(difficulty)
  );
  const [board, setBoard] = useState<FlowBoard>([]);
  const [activeColor, setActiveColor] = useState<FlowColor | null>(null);
  const [activePath, setActivePath] = useState<{ row: number; col: number }[]>(
    []
  );
  const [movesCount, setMovesCount] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);

  // Reference to track touch movement
  const touchRef = useRef<{
    isMoving: boolean;
    lastRow: number;
    lastCol: number;
  }>({
    isMoving: false,
    lastRow: -1,
    lastCol: -1,
  });

  // Initialize the board when level changes
  useEffect(() => {
    initializeBoard(level);
  }, [level]);

  // Check if level is complete
  useEffect(() => {
    if (board.length > 0 && isLevelComplete(board)) {
      playSound("win");

      // Delay to allow for completion animation
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [board, onComplete, playSound]);

  // Initialize the board from the level data
  const initializeBoard = (levelData: FlowLevel) => {
    const size = levelData.size;
    const newBoard: FlowBoard = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));

    // Place endpoints
    levelData.endpoints.forEach(({ row, col, color }) => {
      newBoard[row][col] = {
        row,
        col,
        color,
        isEndpoint: true,
        connections: [],
      };
    });

    setBoard(newBoard);
    setActiveColor(null);
    setActivePath([]);
    setMovesCount(0);
  };

  // Handle cell press (start drawing a path)
  const handleCellPress = (row: number, col: number) => {
    const cell = board[row][col];

    // Reset touch tracking
    touchRef.current = {
      isMoving: true,
      lastRow: row,
      lastCol: col,
    };

    // If pressing on an endpoint, start a path
    if (cell && cell.isEndpoint) {
      setActiveColor(cell.color);
      setActivePath([{ row, col }]);
      playSound("click");

      // Clear existing connections of this color
      const newBoard = clearConnections(board, cell.color);
      setBoard(newBoard);
    } else {
      // If not an endpoint, do nothing
      setActiveColor(null);
      setActivePath([]);
    }
  };

  // Handle moving over cells (continue drawing a path)
  const handleCellMove = (row: number, col: number) => {
    if (!activeColor || !touchRef.current.isMoving) return;

    // Avoid duplicate processing for the same cell
    if (row === touchRef.current.lastRow && col === touchRef.current.lastCol) {
      return;
    }

    touchRef.current.lastRow = row;
    touchRef.current.lastCol = col;

    const lastPoint = activePath[activePath.length - 1];

    // Check if the cell is adjacent to the last point
    const isAdjacent =
      (Math.abs(row - lastPoint.row) === 1 && col === lastPoint.col) ||
      (Math.abs(col - lastPoint.col) === 1 && row === lastPoint.row);

    if (!isAdjacent) return;

    // Check if the cell is empty or an endpoint of the same color
    const cell = board[row][col];

    if (!cell) {
      // Empty cell, continue the path
      setActivePath([...activePath, { row, col }]);

      // Update the board with the new path segment
      const newBoard = addConnection(
        board,
        lastPoint.row,
        lastPoint.col,
        row,
        col,
        activeColor
      );

      setBoard(newBoard);
      playSound("move");
    } else if (cell.isEndpoint && cell.color === activeColor) {
      // Reached the matching endpoint, complete the path
      setActivePath([...activePath, { row, col }]);

      // Update the board with the final path segment
      const newBoard = addConnection(
        board,
        lastPoint.row,
        lastPoint.col,
        row,
        col,
        activeColor
      );

      setBoard(newBoard);
      setActiveColor(null);
      setActivePath([]);
      setMovesCount(movesCount + 1);
      onMove();
      playSound("move");
    }
  };

  // Handle releasing touch
  const handleCellRelease = () => {
    touchRef.current.isMoving = false;

    if (activePath.length > 0) {
      setActiveColor(null);
      setActivePath([]);
    }
  };

  // Reset the current level
  const handleReset = () => {
    playSound("click");

    Alert.alert("Reset Level", "Are you sure you want to reset this level?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: () => {
          initializeBoard(level);
        },
      },
    ]);
  };

  // Get a new level
  const handleNewLevel = () => {
    playSound("click");

    const newLevel = generateLevel(difficulty);
    setLevel(newLevel);
    setLevelNumber(levelNumber + 1);
  };

  const isLandscape = orientation === "landscape";

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <View style={isLandscape ? styles.landscapeBoard : styles.boardContainer}>
        <FlowFreeBoard
          board={board}
          activeColor={activeColor}
          onCellPress={handleCellPress}
          onCellMove={handleCellMove}
          onCellRelease={handleCellRelease}
        />
      </View>

      <View
        style={
          isLandscape ? styles.landscapeControls : styles.controlsContainer
        }
      >
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>{levelNumber}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>
              {level.size}×{level.size}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Flows</Text>
            <Text style={styles.infoValue}>{level.endpoints.length / 2}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleReset}>
            <Text style={styles.iconText}>↻</Text>
            <Text style={styles.actionText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNewLevel}
          >
            <Text style={styles.iconText}>⊞</Text>
            <Text style={styles.actionText}>New Level</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.instructionsText}>
            Connect matching colored dots by drawing a path between them. Fill
            the entire board without leaving any empty cells. Paths cannot cross
            or overlap.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  landscapeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boardContainer: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 360,
    marginBottom: theme.spacing.medium,
  },
  landscapeBoard: {
    width: "50%",
    aspectRatio: 1,
    maxWidth: 400,
  },
  controlsContainer: {
    width: "100%",
    maxWidth: 360,
  },
  landscapeControls: {
    width: "45%",
    maxHeight: 400,
    justifyContent: "space-between",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.medium,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.medium,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  iconText: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: "center",
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.medium,
    borderRadius: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default FlowFreeGame;
