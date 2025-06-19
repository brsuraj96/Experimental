import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Alert, Vibration } from "react-native";
import {
  Difficulty,
  GameType,
  SudokuBoard,
  SudokuSettings,
} from "../../../types";
import SudokuBoardComponent from "./SudokuBoard";
import SudokuControls from "./SudokuControls";
import { useTimer } from "../../../context/TimerContext";
import {
  generateSudoku,
  validateSudoku,
  isGameComplete,
  getHint,
} from "./logic";
import { useTheme } from "../../../context/ThemeContext";
import { useSound } from "../../../hooks/useSound";
import GameHeader from "./GameHeader";
import { ScoreManager } from "../../../utils/scoring";
import { deepClone } from "../../../utils/helpers";

interface SudokuGameProps {
  difficulty: Difficulty;
  onMove: () => void;
  onComplete: () => void;
  orientation: "portrait" | "landscape";
  isGameCompleted: boolean;
  onDifficultyChange: (difficulty: Difficulty) => void;
  settings: SudokuSettings;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

const SUDOKU_MISTAKE_LIMIT = 3;

// Expose imperative handle for restart
export interface SudokuGameHandle {
  restart: () => void;
}

const SudokuGame = forwardRef<SudokuGameHandle, SudokuGameProps>(
  (
    {
      difficulty,
      onMove,
      onComplete,
      orientation,
      isGameCompleted,
      onDifficultyChange,
      settings,
      isPaused = false,
      onPause,
      onResume,
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const { playSound } = useSound();
    const { timer, start, pause, resume, reset, isRunning } = useTimer();
    const [initialBoard, setInitialBoard] = useState<SudokuBoard>(() =>
      generateSudoku(difficulty)
    );
    const [board, setBoard] = useState<SudokuBoard>(() =>
      deepClone(initialBoard)
    );

    // Handle timer state based on game state
    useEffect(() => {
      if (!settings.timer) {
        pause();
        return;
      }

      if (isGameCompleted) {
        pause();
        return;
      }

      if (isPaused) {
        pause();
      } else if (!isRunning) {
        start();
      }
    }, [settings.timer, isGameCompleted, isPaused, isRunning, start, pause]);

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
    const [score, setScore] = useState<number>(0);
    const [previousScore, setPreviousScore] = useState<number>(0);
    const [correctStreak, setCorrectStreak] = useState(0);
    const scoreManager = useRef(new ScoreManager(GameType.SUDOKU, difficulty));
    const [isPausing, setIsPausing] = useState(false);

    // Use settings to control mistake limit
    useEffect(() => {
      if (settings.mistakeLimit && mistakes >= SUDOKU_MISTAKE_LIMIT) {
        Alert.alert(
          "Game Over",
          `You have made ${SUDOKU_MISTAKE_LIMIT} mistakes. Game over.`,
          [{ text: "OK", onPress: () => onComplete() }],
          { cancelable: false }
        );
      }
    }, [mistakes, settings.mistakeLimit, onComplete]);

    // We don't need a separate effect for autoRemoveNotes
    // This is now handled directly in the handleNumberPress function
    // when a number is placed on the board

    // Initialize the game when difficulty changes
    useEffect(() => {
      const newBoard = generateSudoku(difficulty);
      setInitialBoard(deepClone(newBoard));
      setBoard(deepClone(newBoard));
      setSelectedCell(null);
      setSelectedNumber(null);
      setLockedNumber(null);
      setHistory([{ board: deepClone(newBoard), selected: null }]);
      setMistakes(0);
      reset();
      setIsPausing(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);
    }, [difficulty]);

    // Resume game state when unpausing
    useEffect(() => {
      if (!isPaused && isPausing) {
        // Restore last selected cell and number when resuming
        const lastState = history[history.length - 1];
        if (lastState?.selected) {
          setSelectedCell(lastState.selected);
        }
        // Keep lockedNumber state intact when resuming
      }
    }, [isPaused, isPausing, history]);

    // Check if game is completed and apply completion bonuses
    useEffect(() => {
      if (isGameComplete(board) && !isGameCompleted) {
        // Apply completion bonuses (perfect game, no hints, speed bonus)
        scoreManager.current.applyCompletionBonuses();
        setScore(scoreManager.current.getScore());
        onComplete();
      }
    }, [board, onComplete, isGameCompleted, mistakes]);

    // Update the remaining numbers whenever the board changes
    useEffect(() => {
      const remaining = calculateRemainingNumbers(board);
      setRemainingNumbers(remaining);
    }, [board]);
    // Update score when the board changes
    useEffect(() => {
      if (settings.showScore) {
        const newScore = scoreManager.current.getScore();
        setPreviousScore(score);
        setScore(newScore);
      }
    }, [board, settings.showScore]);

    // Update difficulty in score manager
    useEffect(() => {
      scoreManager.current.setDifficulty(difficulty);
    }, [difficulty]);

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
        }; // Check if the move is valid
        const isValid = validateSudoku(newBoard, row, col);
        newBoard[row][col].isError = !isValid;

        if (!isValid) {
          setMistakes((prev) => prev + 1);
          if (settings.audioEffect) {
            playSound("error");
          }
          if (settings.vibration) {
            Vibration.vibrate([0, 100, 50, 100]); // Longer vibration for errors
          }
          scoreManager.current.addMistake();
          updateStreak(false);
        } else {
          if (settings.audioEffect) {
            playSound("move");
          }
          if (settings.vibration) {
            Vibration.vibrate(50);
          }

          // Update streak and score
          updateStreak(true);

          // Auto-remove notes (always, since no setting)
          removeRelatedNotes(newBoard, row, col, number);
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
        // Handle cell selection/deselection
        if (
          selectedCell &&
          selectedCell[0] === row &&
          selectedCell[1] === col
        ) {
          // If clicking the same cell, deselect it
          setSelectedCell(null);
        } else {
          // If clicking a different cell or no cell was selected, select it
          setSelectedCell([row, col]);
        }
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
      if (isGameComplete(board) || isPaused) return; // If a cell is selected, get its solution
      let hint;
      if (selectedCell) {
        const [row, col] = selectedCell;
        const cell = board[row][col];

        // Don't provide hints for fixed cells or correctly filled cells
        if (cell.isFixed || (cell.value !== null && !cell.isError)) {
          Alert.alert(
            "Hint not needed",
            "This cell is already correctly filled."
          );
          return;
        }

        // Get the solution for this cell
        hint = getHint(board, row, col);
      } else {
        // Original hint behavior for when no cell is selected
        hint = getHint(board);
      }

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

      setHistory([...history, { board: newBoard, selected: selectedCell }]);

      // Update score for using a hint and reset streak
      scoreManager.current.addHintUsed();
      setCorrectStreak(0); // Reset streak when using a hint

      if (settings.audioEffect) {
        playSound("move");
      }

      if (settings.vibration) {
        Vibration.vibrate([0, 100, 50, 100]);
      }
      onMove();
    };

    // Handle streak tracking and bonus
    const updateStreak = (isValid: boolean) => {
      if (isValid) {
        const newStreak = correctStreak + 1;
        setCorrectStreak(newStreak);

        // Award streak bonus every 3 correct moves
        if (newStreak % 3 === 0) {
          scoreManager.current.addCorrectMove({ isStreak: true });
        } else {
          scoreManager.current.addCorrectMove();
        }
      } else {
        setCorrectStreak(0); // Reset streak on mistake
      }
    };

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

    // Add a handler to reset to the initial board
    const handleRestart = useCallback(() => {
      setBoard(deepClone(initialBoard));
      setSelectedCell(null);
      setSelectedNumber(null);
      setLockedNumber(null);
      setHistory([{ board: deepClone(initialBoard), selected: null }]);
      setMistakes(0);
      setIsNoteMode(false);
      setCorrectStreak(0);
      setScore(0);
      setPreviousScore(0);
      reset();
      setIsPausing(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);
    }, [initialBoard, reset, difficulty]);

    // Expose restart to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        restart: handleRestart,
      }),
      [handleRestart]
    );

    const isLandscape = orientation === "landscape";

    // Font size mapping
    const fontSizeMap = {
      small: { cell: 18, numpad: 20, note: 8 },
      medium: { cell: 22, numpad: 24, note: 10 },
      large: { cell: 26, numpad: 28, note: 14 },
    };
    const fontSizes = fontSizeMap[settings.fontSize] || fontSizeMap.medium;

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
      <View
        style={[styles.container, isLandscape && styles.landscapeContainer]}
      >
        <GameHeader
          mistakes={mistakes}
          difficulty={difficulty}
          time={timer}
          isGameCompleted={isGameCompleted}
          showDifficultySelector
          onDifficultyChange={onDifficultyChange}
          score={score}
          previousScore={previousScore}
          settings={settings}
          isPaused={isPaused}
          gameType={GameType.SUDOKU}
          onPause={onPause}
          onResume={onResume}
        />
        <View style={isLandscape ? styles.landscapeBoard : styles.board}>
          <SudokuBoardComponent
            board={board}
            selectedCell={selectedCell}
            onCellPress={handleCellPress}
            settings={settings}
            lockedNumber={lockedNumber}
            cellFontSize={fontSizes.cell}
            noteFontSize={fontSizes.note}
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
                ? getValidNumbersForNotes(
                    board,
                    selectedCell[0],
                    selectedCell[1]
                  )
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
            settings={settings}
            numpadFontSize={fontSizes.numpad}
          />
        </View>
      </View>
    );
  }
);

export default SudokuGame;
