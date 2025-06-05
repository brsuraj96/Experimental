import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, Vibration, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Difficulty, SudokuBoard, GameType } from "../../../types";
import SudokuBoardComponent from "./SudokuBoard";
import SudokuControls from "./SudokuControls";
import {
  generateSudoku,
  validateSudoku,
  isGameComplete,
  getHint,
} from "./logic";
import { useTheme } from "../../../context/ThemeContext";
import useSound from "../../../hooks/useSound";
import GameHeader from "./GameHeader";
import { Settings } from "../../../context/SettingsContext";

// Helper function to safely access web storage
const getWebStorage = () => {
  if (Platform.OS === "web") {
    try {
      const storage =
        typeof globalThis !== "undefined" ? globalThis.localStorage : null;
      if (storage) {
        const testKey = "__storage_test__";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return storage;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

interface SudokuGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
  startTime: number;
  isGameCompleted: boolean;
  onDifficultyChange: (difficulty: Difficulty) => void;
  settings: Settings;
  isPaused?: boolean;
}

const SudokuGame: React.FC<SudokuGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
  startTime,
  isGameCompleted,
  onDifficultyChange,
  settings,
  isPaused,
}) => {
  const { currentTheme } = useTheme();
  const { playSound } = useSound();
  const [board, setBoard] = useState<SudokuBoard>(() =>
    generateSudoku(difficulty)
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [lockedNumber, setLockedNumber] = useState<number | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [history, setHistory] = useState<
    Array<{ board: SudokuBoard; selected: [number, number] | null }>
  >([]);
  const [remainingNumbers, setRemainingNumbers] = useState<number[]>(
    Array(9).fill(9)
  );
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(time);
  const pauseTimeRef = useRef<number | null>(null);

  // Save game state effect
  useEffect(() => {
    const saveGameState = async () => {
      const gameState = {
        board,
        time,
        mistakes,
        difficulty,
        history,
      };
      try {
        const webStorage = getWebStorage();
        if (webStorage) {
          webStorage.setItem(`sudoku_game_state`, JSON.stringify(gameState));
        } else {
          await AsyncStorage.setItem(
            `sudoku_game_state`,
            JSON.stringify(gameState)
          );
        }
      } catch (error) {
        console.error("Error saving game state:", error);
      }
    };

    // Save state when paused or unmounting
    if (isPaused) {
      saveGameState();
      pauseTimeRef.current = Date.now();
      // Save pause timestamp
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.setItem(
          `sudoku_pause_time_${difficulty}`,
          pauseTimeRef.current.toString()
        );
      } else {
        AsyncStorage.setItem(
          `sudoku_pause_time_${difficulty}`,
          pauseTimeRef.current.toString()
        ).catch((error) => console.error("Error saving pause time:", error));
      }
    }

    return () => {
      saveGameState();
    };
  }, [isPaused, board, time, mistakes, difficulty, history]);

  // Timer control effect
  useEffect(() => {
    // Clean up any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if disabled, paused, or completed
    if (!settings.timer || isPaused || isGameCompleted) {
      if (isPaused) {
        const timeSnapshot = time;
        const pauseTimestamp = Date.now();
        pauseTimeRef.current = pauseTimestamp;

        // Save game state and pause time
        const webStorage = getWebStorage();
        if (webStorage) {
          webStorage.setItem(
            `sudoku_time_${difficulty}`,
            timeSnapshot.toString()
          );
          webStorage.setItem(
            `sudoku_pause_${difficulty}`,
            pauseTimestamp.toString()
          );
        } else {
          AsyncStorage.multiSet([
            [`sudoku_time_${difficulty}`, timeSnapshot.toString()],
            [`sudoku_pause_${difficulty}`, pauseTimestamp.toString()],
          ]).catch((error) =>
            console.error("Error saving pause state:", error)
          );
        }
      }
      return;
    }

    // When resuming, calculate and account for pause duration
    const now = Date.now();
    const pauseDuration = pauseTimeRef.current ? now - pauseTimeRef.current : 0;
    const startRef = now - time * 1000 - pauseDuration;

    // Reset refs and start new timer
    lastTimeRef.current = time;
    pauseTimeRef.current = null;

    timerRef.current = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startRef) / 1000);
      setTime(currentTime);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [settings.timer, isPaused, isGameCompleted, time, difficulty]);

  // Use settings to control mistake limit
  useEffect(() => {
    if (settings.mistakeLimit && mistakes >= 3) {
      Alert.alert(
        "Game Over",
        "You have made 3 mistakes. Game over.",
        [{ text: "OK", onPress: () => onComplete() }],
        { cancelable: false }
      );
    }
  }, [mistakes, settings.mistakeLimit, onComplete]);

  // We don't need a separate effect for autoRemoveNotes
  // This is now handled directly in the handleNumberPress function
  // when a number is placed on the board

  // Use settings to control autoComplete
  useEffect(() => {
    if (!settings.autoComplete) return;

    if (isGameComplete(board)) {
      onComplete();
    }
  }, [board, settings.autoComplete, onComplete]);

  const calculateRemainingNumbers = (currentBoard: SudokuBoard) => {
    const remaining = Array(9).fill(9);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = currentBoard[row][col].value;
        if (value !== null) {
          remaining[value - 1]--;
        }
      }
    }
    return remaining;
  };

  const getValidNumbersForNotes = (
    currentBoard: SudokuBoard,
    row: number,
    col: number
  ): boolean[] => {
    const validNumbers = Array(9).fill(true);

    // Check row
    for (let c = 0; c < 9; c++) {
      const value = currentBoard[row][c].value;
      if (value !== null) {
        validNumbers[value - 1] = false;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      const value = currentBoard[r][col].value;
      if (value !== null) {
        validNumbers[value - 1] = false;
      }
    }

    // Check 3x3 grid
    const gridRow = Math.floor(row / 3) * 3;
    const gridCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const value = currentBoard[gridRow + r][gridCol + c].value;
        if (value !== null) {
          validNumbers[value - 1] = false;
        }
      }
    }

    return validNumbers;
  };

  // Initialize the game when difficulty changes
  useEffect(() => {
    const newBoard = generateSudoku(difficulty);
    setBoard(newBoard);
    setSelectedCell(null);
    setSelectedNumber(null);
    setLockedNumber(null);
    setHistory([{ board: newBoard, selected: null }]);
    setMistakes(0);
    setTime(0);
  }, [difficulty]);

  // Check if game is completed
  useEffect(() => {
    if (isGameComplete(board) && !isGameCompleted) {
      onComplete();
    }
  }, [board, onComplete, isGameCompleted]);

  // Update the remaining numbers whenever the board changes
  useEffect(() => {
    const remaining = calculateRemainingNumbers(board);
    setRemainingNumbers(remaining);
  }, [board]);

  const removeRelatedNotes = (
    currentBoard: SudokuBoard,
    row: number,
    col: number,
    number: number
  ) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const sameRow = r === row;
        const sameCol = c === col;
        const sameBlock =
          Math.floor(r / 3) === Math.floor(row / 3) &&
          Math.floor(c / 3) === Math.floor(col / 3);

        if (
          (sameRow || sameCol || sameBlock) &&
          currentBoard[r][c].value === null
        ) {
          currentBoard[r][c] = {
            ...currentBoard[r][c],
            notes: [...currentBoard[r][c].notes],
          };
          currentBoard[r][c].notes[number - 1] = false;
        }
      }
    }
  };

  // Function to place a number on the board
  const placeNumber = (number: number, row: number, col: number) => {
    const cell = board[row][col];

    // Handle self-correction in number-first mode
    if (settings.numberFirst && cell.value === number) {
      if (cell.isError) {
        // Clear error number on second tap
        const newBoard = [...board.map((r) => [...r])];
        newBoard[row][col] = {
          ...cell,
          value: null,
          notes: Array(9).fill(false),
          isError: false,
        };
        setBoard(newBoard);
        setHistory([...history, { board: newBoard, selected: [row, col] }]);

        if (settings.audioEffect) {
          playSound("click");
        }
        if (settings.vibration) {
          Vibration.vibrate(50);
        }
        return;
      }
      return; // If correct number, do nothing
    }

    // Create a new board with the updated cell
    const newBoard = [...board.map((r) => [...r])];

    if (isNoteMode) {
      // Handle note mode
      newBoard[row][col] = {
        ...cell,
        notes: [...cell.notes],
      };
      newBoard[row][col].notes[number - 1] = !cell.notes[number - 1];
    } else {
      // Handle normal mode
      newBoard[row][col] = {
        ...cell,
        value: number,
        notes: Array(9).fill(false),
      };

      // Check if the move is valid
      const isValid = validateSudoku(newBoard, row, col);
      newBoard[row][col].isError = !isValid;

      const isValidMove = isValid;
      if (!isValidMove) {
        setMistakes((prev) => prev + 1);
        if (settings.audioEffect) {
          playSound("error");
        }
        if (settings.vibration) {
          Vibration.vibrate([0, 100, 50, 100]); // Longer vibration for errors
        }
      } else {
        if (settings.audioEffect) {
          playSound("move");
        }
        if (settings.vibration) {
          Vibration.vibrate(50);
        }

        // Auto-remove notes if enabled and the move is valid
        if (settings.autoRemoveNotes) {
          removeRelatedNotes(newBoard, row, col, number);
        }
      }
    }

    setBoard(newBoard);
    setHistory([...history, { board: newBoard, selected: [row, col] }]);
    onMove();
  };

  const handleCellPress = (row: number, col: number) => {
    if (isPaused) return;

    if (settings.audioEffect) {
      playSound("click");
    }

    if (settings.vibration) {
      Vibration.vibrate(50);
    }

    // If in number first mode and a number is locked, place that number
    if (settings.numberFirst && lockedNumber !== null) {
      const cell = board[row][col];

      // Don't allow placing numbers on fixed cells
      if (cell.isFixed) return;

      // Place the locked number
      placeNumber(lockedNumber, row, col);
    } else {
      // Allow cell selection in both modes when no number is locked
      setSelectedCell([row, col]);
    }
  };

  const handleNumberPress = (number: number) => {
    if (isPaused) return;

    // If number first mode is enabled
    if (settings.numberFirst) {
      // If this number is already locked, unlock it
      if (lockedNumber === number) {
        setLockedNumber(null);
        setSelectedNumber(null);

        if (settings.audioEffect) {
          playSound("click");
        }

        if (settings.vibration) {
          Vibration.vibrate(50);
        }
      }
      // If no number is locked, do nothing (require long press)
      return;
    }

    // In cell first mode, proceed as before
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    // Use the placeNumber function to place the number
    placeNumber(number, row, col);
  };

  // Handle long press on a number
  const handleNumberLongPress = (number: number | null) => {
    if (isPaused || !settings.numberFirst || number === null) return;

    // Toggle the locked state
    if (lockedNumber === number) {
      setLockedNumber(null);
      setSelectedNumber(null);

      if (settings.audioEffect) {
        playSound("click");
      }

      if (settings.vibration) {
        Vibration.vibrate(50);
      }
    } else {
      setLockedNumber(number);
      setSelectedNumber(number);
      setSelectedCell(null);

      if (settings.audioEffect) {
        playSound("click");
      }

      if (settings.vibration) {
        Vibration.vibrate([0, 100, 50, 100]); // Double vibration to indicate lock
      }
    }
  };

  const handleErasePress = () => {
    if (isPaused) return;

    // In number first mode, clear the selected number when toggling notes
    if (settings.numberFirst && selectedNumber !== null) {
      setSelectedNumber(null);
    }

    // In number first mode, clear the selected number and locked number
    if (
      settings.numberFirst &&
      (selectedNumber !== null || lockedNumber !== null)
    ) {
      setSelectedNumber(null);

      // If there's a locked number, clear it
      if (lockedNumber !== null) {
        setLockedNumber(null);
      }

      if (settings.audioEffect) {
        playSound("click");
      }

      if (settings.vibration) {
        Vibration.vibrate(50);
      }

      return;
    }

    // In cell first mode, proceed as before
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cell = board[row][col];

    // Don't allow erasing fixed cells or correct entries
    if (cell.isFixed || (cell.value !== null && !cell.isError)) return;

    const newBoard = [...board.map((r) => [...r])];
    newBoard[row][col] = {
      ...cell,
      value: null,
      notes: Array(9).fill(false),
      isError: false,
    };

    setBoard(newBoard);

    // In number first mode, clear the selected number
    if (settings.numberFirst) {
      setSelectedNumber(null);
    }

    setHistory([...history, { board: newBoard, selected: selectedCell }]);

    if (settings.audioEffect) {
      playSound("click");
    }

    if (settings.vibration) {
      Vibration.vibrate(50);
    }
  };

  const handleNotesToggle = () => {
    if (isPaused) return;

    // In number first mode, clear the locked number when toggling notes
    if (settings.numberFirst && lockedNumber !== null) {
      setLockedNumber(null);
      setSelectedNumber(null);
    }

    setIsNoteMode(!isNoteMode);

    if (settings.audioEffect) {
      playSound("click");
    }

    if (settings.vibration) {
      Vibration.vibrate(50);
    }
  };

  const handleUndoPress = () => {
    if (history.length <= 1 || isPaused) return;

    // In number first mode, clear the locked number when undoing
    if (settings.numberFirst && lockedNumber !== null) {
      setLockedNumber(null);
      setSelectedNumber(null);
    }

    const newHistory = [...history];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];

    setBoard(previous.board);
    setSelectedCell(previous.selected);
    setHistory(newHistory);

    if (settings.audioEffect) {
      playSound("click");
    }

    if (settings.vibration) {
      Vibration.vibrate(50);
    }
  };

  const handleHintPress = () => {
    if (isGameComplete(board) || isPaused) return;

    const hint = getHint(board);
    if (!hint) {
      Alert.alert("No hints available", "No valid hints found at this time.");
      return;
    }

    const { row, col, value } = hint;
    const newBoard = [...board.map((r) => [...r])];
    newBoard[row][col] = {
      ...newBoard[row][col],
      value,
      notes: Array(9).fill(false),
      isError: false,
    };

    setBoard(newBoard);

    // In number first mode, clear the locked number
    if (settings.numberFirst && lockedNumber !== null) {
      setLockedNumber(null);
      setSelectedNumber(null);
    }

    setSelectedCell([row, col]);
    setHistory([...history, { board: newBoard, selected: [row, col] }]);

    if (settings.audioEffect) {
      playSound("hint");
    }

    if (settings.vibration) {
      Vibration.vibrate([0, 100, 50, 100]);
    }

    onMove();
  };

  // Persist game state when component unmounts or game is paused
  useEffect(() => {
    const saveGameState = async () => {
      const gameState = {
        board,
        time,
        mistakes,
        difficulty,
        history,
      };
      try {
        const webStorage = getWebStorage();
        if (webStorage) {
          webStorage.setItem(`sudoku_game_state`, JSON.stringify(gameState));
        } else {
          await AsyncStorage.setItem(
            `sudoku_game_state`,
            JSON.stringify(gameState)
          );
        }
      } catch (error) {
        console.error("Error saving game state:", error);
      }
    };

    // Save state when paused or unmounting
    if (isPaused) {
      saveGameState();
      pauseTimeRef.current = Date.now();
      // Save pause timestamp
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.setItem(
          `sudoku_pause_time_${difficulty}`,
          pauseTimeRef.current.toString()
        );
      } else {
        AsyncStorage.setItem(
          `sudoku_pause_time_${difficulty}`,
          pauseTimeRef.current.toString()
        ).catch((error) => console.error("Error saving pause time:", error));
      }
    }

    return () => {
      saveGameState();
    };
  }, [isPaused, board, time, mistakes, difficulty, history]);

  // Load saved game state on mount
  useEffect(() => {
    const loadGameState = async () => {
      try {
        let savedState = null;
        let savedPauseTime = null;

        if (Platform.OS === "web") {
          savedState = localStorage.getItem(`sudoku_game_state`);
          savedPauseTime = localStorage.getItem(
            `sudoku_pause_time_${difficulty}`
          );
        } else {
          savedState = await AsyncStorage.getItem(`sudoku_game_state`);
          savedPauseTime = await AsyncStorage.getItem(
            `sudoku_pause_time_${difficulty}`
          );
        }

        if (savedState) {
          const gameState = JSON.parse(savedState);
          // Only restore if the difficulty matches
          if (gameState.difficulty === difficulty) {
            setBoard(gameState.board);
            setMistakes(gameState.mistakes);
            setHistory(gameState.history);

            // If we have a pause time, use it to properly resume the timer
            if (savedPauseTime) {
              const pauseTime = parseInt(savedPauseTime);
              pauseTimeRef.current = pauseTime;

              // If we're not paused, we need to adjust the time to account for the time since the game was paused
              if (!isPaused) {
                const now = Date.now();
                const elapsedSincePause = Math.floor((now - pauseTime) / 1000);
                setTime(gameState.time + elapsedSincePause);
              } else {
                // If still paused, just use the saved time
                setTime(gameState.time);
              }
            } else {
              setTime(gameState.time);
            }
          }
        }
      } catch (error) {
        console.error("Error loading saved game state:", error);
      }
    };

    loadGameState();
  }, [difficulty]);

  const isLandscape = orientation === "landscape";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: currentTheme.spacing.large,
    },
    landscapeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    board: {
      width: "100%",
      aspectRatio: 1,
      maxWidth: 360,
      marginBottom: currentTheme.spacing.medium,
    },
    landscapeBoard: {
      width: "50%",
      aspectRatio: 1,
      maxWidth: 400,
      marginRight: currentTheme.spacing.medium,
      justifyContent: "center",
    },
    controls: {
      width: "100%",
      maxWidth: 360,
    },
    landscapeControls: {
      width: "40%",
      maxWidth: 300,
    },
  });

  return (
    <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <GameHeader
        mistakes={mistakes}
        difficulty={difficulty}
        time={time}
        startTime={startTime}
        isGameCompleted={isGameCompleted}
        showDifficultySelector
        onDifficultyChange={onDifficultyChange}
        settings={settings}
        gameType={GameType.SUDOKU}
        isPaused={isPaused}
      />
      <View style={isLandscape ? styles.landscapeBoard : styles.board}>
        <SudokuBoardComponent
          board={board}
          selectedCell={selectedCell}
          onCellPress={handleCellPress}
          settings={settings}
          lockedNumber={lockedNumber}
        />
      </View>
      <View style={isLandscape ? styles.landscapeControls : styles.controls}>
        <SudokuControls
          onNumberPress={handleNumberPress}
          onNumberLongPress={handleNumberLongPress}
          onErasePress={handleErasePress}
          onNotesToggle={handleNotesToggle}
          onUndoPress={handleUndoPress}
          onHintPress={handleHintPress}
          isNoteMode={isNoteMode}
          canUndo={history.length > 1}
          isLandscape={isLandscape}
          remainingNumbers={remainingNumbers}
          validNumbers={
            selectedCell && isNoteMode
              ? getValidNumbersForNotes(board, selectedCell[0], selectedCell[1])
              : Array(9).fill(true)
          }
          selectedNumber={selectedNumber}
          numberFirstMode={settings.numberFirst}
          lockedNumber={lockedNumber}
          disableNotesButton={
            selectedCell
              ? board[selectedCell[0]][selectedCell[1]].isFixed
              : false
          }
        />
      </View>
    </View>
  );
};

export default SudokuGame;
