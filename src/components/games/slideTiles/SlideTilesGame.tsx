import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { Difficulty } from "../../../types";
import SlideTilesBoard from "./SlideTilesBoard";
import {
  generateBoard,
  isSolved,
  moveTile,
  canMoveTile,
  shuffleBoard,
  getBoardSize,
} from "./logic";
import { theme } from "../../../styles/theme";
import { useSound } from "../../../hooks/useSound";
import { SlideTilesSettings } from "../../../types/settings";
import { useTheme } from "../../../context/ThemeContext";

// Extend SlideTilesSettings with additional properties needed for this component
interface ExtendedSlideTilesSettings extends SlideTilesSettings {
  showScore: boolean;
  completionRate: boolean;
  lightningMode: boolean;
}

interface SlideTilesGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
  settings: ExtendedSlideTilesSettings;
  isPaused?: boolean;
}

const SlideTilesGame: React.FC<SlideTilesGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
  settings,
  isPaused = false,
}): React.ReactElement => {
  const { playSound } = useSound();
  const { currentTheme } = useTheme();
  const boardSize = getBoardSize(difficulty);
  const [board, setBoard] = useState(() => generateBoard(boardSize));
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer implementation based on settings and pause state
  useEffect(() => {
    const boardSolved = isSolved(board);
    const shouldRunTimer =
      settings.timer && gameStarted && !boardSolved && !isPaused;

    if (shouldRunTimer) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setTime((prev) => prev + 1);
        }, 1000);
      }
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.timer, gameStarted, board, isPaused]);

  // Initialize the game when difficulty changes
  useEffect(() => {
    const size = getBoardSize(difficulty);
    const newBoard = generateBoard(size);
    setBoard(newBoard);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setCompletionPercentage(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [difficulty]);

  useEffect(() => {
    if (gameStarted && isSolved(board)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      onComplete();
    }
  }, [board, gameStarted, onComplete]);

  // Calculate completion percentage
  useEffect(() => {
    if (settings.completionRate && gameStarted) {
      const totalTiles = boardSize * boardSize;
      let correctTiles = 0;

      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          const expectedValue = row * boardSize + col + 1;
          // The last tile should be 0 (empty)
          const expected =
            row === boardSize - 1 && col === boardSize - 1 ? 0 : expectedValue;

          if (board[row][col] === expected) {
            correctTiles++;
          }
        }
      }

      setCompletionPercentage(Math.floor((correctTiles / totalTiles) * 100));
    }
  }, [board, settings.completionRate, gameStarted, boardSize]);

  const resetGame = () => {
    const size = getBoardSize(difficulty);
    const newBoard = generateBoard(size);
    setBoard(newBoard);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setCompletionPercentage(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startGame = () => {
    const shuffled = shuffleBoard(board);
    setBoard(shuffled);
    setGameStarted(true);
  };

  const handleTilePress = (row: number, col: number) => {
    if (!gameStarted) return;

    if (canMoveTile(board, row, col)) {
      const newBoard = moveTile(board, row, col);
      setBoard(newBoard);
      setMoves(moves + 1);
      onMove();

      // Apply settings for sound and vibration
      if (settings.audioEffect) {
        playSound("move");
      }

      if (settings.vibration) {
        Vibration.vibrate(50);
      }
    } else {
      if (settings.audioEffect) {
        playSound("error");
      }

      if (settings.vibration) {
        Vibration.vibrate([0, 50, 50, 50]);
      }
    }
  };

  const isLandscape = orientation === "landscape";

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <View style={isLandscape ? styles.landscapeBoard : styles.boardContainer}>
        <SlideTilesBoard
          board={board}
          onTilePress={handleTilePress}
          gameStarted={gameStarted}
        />
      </View>

      <View
        style={
          isLandscape ? styles.landscapeControls : styles.controlsContainer
        }
      >
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text
              style={[styles.infoLabel, { color: currentTheme.colors.text }]}
            >
              Moves
            </Text>
            <Text
              style={[styles.infoValue, { color: currentTheme.colors.text }]}
            >
              {moves}
            </Text>
          </View>

          {settings.timer && (
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: currentTheme.colors.text }]}
              >
                Time
              </Text>
              <Text
                style={[styles.infoValue, { color: currentTheme.colors.text }]}
              >
                {formatTime(time)}
              </Text>
            </View>
          )}

          {!settings.timer && (
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: currentTheme.colors.text }]}
              >
                Size
              </Text>
              <Text
                style={[styles.infoValue, { color: currentTheme.colors.text }]}
              >
                {boardSize}×{boardSize}
              </Text>
            </View>
          )}
        </View>

        {settings.completionRate && gameStarted && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionLabel}>Completion</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.completionValue}>{completionPercentage}%</Text>
          </View>
        )}

        {!gameStarted ? (
          <TouchableOpacity
            style={[
              styles.startButton,
              settings.lightningMode && styles.lightningButton,
            ]}
            onPress={startGame}
          >
            <Text style={styles.startButtonIcon}>▶</Text>
            <Text style={styles.startButtonText}>
              {settings.lightningMode ? "Lightning Mode" : "Start Game"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.resetButtonIcon}>↻</Text>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}

        {settings.showScore && gameStarted && (
          <View style={styles.scoreContainer}>
            <Text
              style={[styles.scoreLabel, { color: currentTheme.colors.text }]}
            >
              Score
            </Text>
            <Text
              style={[styles.scoreValue, { color: currentTheme.colors.text }]}
            >
              {Math.max(0, 1000 - moves * 10 - time * 2)}
            </Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Play:</Text>
          <Text style={styles.instructionsText}>
            Rearrange the tiles by sliding them into the empty space to form the
            original numbered sequence. The empty space should be in the bottom
            right corner.
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
    justifyContent: "space-around",
    marginBottom: theme.spacing.medium,
  },
  infoItem: {
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  completionContainer: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.medium,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
    alignItems: "center",
  },
  completionLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  completionValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  scoreContainer: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.medium,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
  },
  lightningButton: {
    backgroundColor: "#FF9800", // Orange color for lightning mode
  },
  startButtonIcon: {
    fontSize: 20,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  startButtonText: {
    color: theme.colors.textLight,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: theme.colors.backgroundLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: theme.spacing.medium,
  },
  resetButtonIcon: {
    fontSize: 20,
    color: theme.colors.text,
    textAlign: "center",
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
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

export default SlideTilesGame;
