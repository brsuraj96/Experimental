import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Difficulty, SudokuBoard } from "../../../types";
import SudokuBoardComponent from "./SudokuBoard";
import SudokuControls from "./SudokuControls";
import {
  generateSudoku,
  validateSudoku,
  isGameComplete,
  getHint,
} from "./logic";
import { theme } from "../../../styles/theme";
import useSound from "../../../hooks/useSound";
import GameHeader from "./GameHeader";

interface SudokuGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
  startTime: number;
  isGameCompleted: boolean;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const SudokuGame: React.FC<SudokuGameProps> = ({
  difficulty,
  onMove,
  onComplete,
  orientation,
  startTime,
  isGameCompleted,
  onDifficultyChange,
}) => {
  const { playSound } = useSound();
  const [board, setBoard] = useState<SudokuBoard>(() =>
    generateSudoku(difficulty)
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [history, setHistory] = useState<
    Array<{ board: SudokuBoard; selected: [number, number] | null }>
  >([]);
  const [remainingNumbers, setRemainingNumbers] = useState<number[]>(
    Array(9).fill(9)
  );
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);

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
    setHistory([{ board: newBoard, selected: null }]);
  }, [difficulty]);

  // Check if game is completed
  useEffect(() => {
    if (isGameComplete(board)) {
      onComplete();
    }
  }, [board, onComplete]);

  // Update the remaining numbers whenever the board changes
  useEffect(() => {
    const remaining = calculateRemainingNumbers(board);
    setRemainingNumbers(remaining);
  }, [board]);

  // Add timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCellPress = (row: number, col: number) => {
    playSound("click");
    setSelectedCell([row, col]);
  };

  const handleNumberPress = (number: number) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

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

      if (!isValid) {
        setMistakes((prev) => prev + 1);
        playSound("error");
      } else {
        playSound("move");
      }
    }

    setBoard(newBoard);
    setHistory([...history, { board: newBoard, selected: selectedCell }]);
    onMove();
  };

  const handleErasePress = () => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    const newBoard = [...board.map((r) => [...r])];
    newBoard[row][col] = {
      ...cell,
      value: null,
      notes: Array(9).fill(false),
      isError: false,
    };

    setBoard(newBoard);
    setHistory([...history, { board: newBoard, selected: selectedCell }]);
    playSound("click");
  };

  const handleNotesToggle = () => {
    setIsNoteMode(!isNoteMode);
    playSound("click");
  };

  const handleUndoPress = () => {
    if (history.length <= 1) return;

    const newHistory = [...history];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];

    setBoard(previous.board);
    setSelectedCell(previous.selected);
    setHistory(newHistory);
    playSound("click");
  };

  const handleHintPress = () => {
    if (isGameComplete(board)) return;

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
    setSelectedCell([row, col]);
    setHistory([...history, { board: newBoard, selected: [row, col] }]);
    playSound("hint");
    onMove();
  };

  const isLandscape = orientation === "landscape";

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
      />
      <View style={isLandscape ? styles.landscapeBoard : styles.board}>
        <SudokuBoardComponent
          board={board}
          selectedCell={selectedCell}
          onCellPress={handleCellPress}
        />
      </View>
      <View style={isLandscape ? styles.landscapeControls : styles.controls}>
        <SudokuControls
          onNumberPress={handleNumberPress}
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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.large,
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
    marginBottom: theme.spacing.medium,
  },
  landscapeBoard: {
    width: "50%",
    aspectRatio: 1,
    maxWidth: 400,
    marginRight: theme.spacing.medium,
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

export default SudokuGame;
