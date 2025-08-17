import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Vibration, ActivityIndicator } from "react-native";
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
import {
  loadAutosaveState,
  uploadAutosaveStateToCloud,
  downloadAutosaveStateFromCloud,
  clearAutosaveState,
} from "../../../utils/storage";
import { useGameAutosave } from "../../../hooks/useGameAutosave";
import FullScreenPrompt from "../../common/FullScreenPrompt";
import Dialog from "../../common/Dialog";

interface SudokuGameProps {
  title: string;
  subtitle: string;
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
  skipRestoreOnMount?: boolean;
  navigation?: any; // Add navigation prop
}

const SUDOKU_MISTAKE_LIMIT = 3;

// Expose imperative handle for restart
export interface SudokuGameHandle {
  restart: () => void;
}

const AUTOSAVE_INTERVAL = 10000; // 10 seconds

const SudokuGame = forwardRef<SudokuGameHandle, SudokuGameProps>(
  (
    {
      title,
      subtitle,
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
      skipRestoreOnMount,
      navigation, // Destructure navigation prop
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const { playSound } = useSound();
    const { timer, start, pause, resume, reset, isRunning } = useTimer();

    // Ensure settings has a default value for remainingHints
    const updatedSettings = {
      ...settings,
      remainingHints: settings.remainingHints ?? 1, // Default to 1 if not provided
    };

    const [initialBoard, setInitialBoard] = useState<SudokuBoard>(() =>
      generateSudoku(difficulty)
    );
    const [board, setBoard] = useState<SudokuBoard>(() =>
      deepClone(initialBoard)
    );

    // Handle timer state based on game state
    useEffect(() => {
      const shouldPause = !settings.timer || isGameCompleted || isPaused;

      if (shouldPause && isRunning) {
        pause();
      } else if (!shouldPause && !isRunning && !isPaused) {
        start();
      }
    }, [settings.timer, isGameCompleted, isPaused, isRunning, pause, start]);

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
    const [showContinueDialog, setShowContinueDialog] = useState(false);
    const [pendingRestoreState, setPendingRestoreState] = useState<any>(null);
    const [hasCheckedAutosave, setHasCheckedAutosave] = useState(false);
    const [restoredFromSave, setRestoredFromSave] = useState(false);
    const [isGameActive, setIsGameActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [remainingHints, setRemainingHints] = useState(1); // Start with 1 free hint
    const [showGameOverDialog, setShowGameOverDialog] = useState(false);
    const [hasUsedSecondChance, setHasUsedSecondChance] = useState(false);
    // Placeholder: get userId from context or props if available
    const userId = null; // Replace with actual user id if signed in

    // --- AUTOSAVE/RESTORE LOGIC ---
    // Serialize current game state
    const getCurrentGameState = useCallback(
      () => ({
        initialBoard,
        board,
        selectedCell,
        selectedNumber,
        lockedNumber,
        isNoteMode,
        history,
        remainingNumbers,
        mistakes,
        score,
        previousScore,
        correctStreak,
        isPausing,
        timer,
        difficulty,
        settings,
        remainingHints,
      }),
      [
        initialBoard,
        board,
        selectedCell,
        selectedNumber,
        lockedNumber,
        isNoteMode,
        history,
        remainingNumbers,
        mistakes,
        score,
        previousScore,
        correctStreak,
        isPausing,
        timer,
        difficulty,
        settings,
        remainingHints,
      ]
    );

    // Restore game state from saved object (robust: set all values atomically)
    const restoreGameState = useCallback(
      (saved: any) => {
        if (!saved) return;

        console.log("[Autosave] Restoring game state:", {
          hasBoard: !!saved.board,
          hasTimer: typeof saved.timer === "number",
          hasScore: typeof saved.score === "number",
          difficulty: saved.difficulty,
          savedKeys: Object.keys(saved),
        });

        // Set all state in a single batch to avoid partial updates
        const restoreDifficulty = saved.difficulty || difficulty;

        setInitialBoard(
          saved.initialBoard || generateSudoku(restoreDifficulty)
        );
        setBoard(saved.board || generateSudoku(restoreDifficulty));
        setSelectedCell(saved.selectedCell ?? null);
        setSelectedNumber(saved.selectedNumber ?? null);
        setLockedNumber(saved.lockedNumber ?? null);
        setIsNoteMode(saved.isNoteMode ?? false);
        setHistory(
          saved.history ?? [
            {
              board: deepClone(
                saved.initialBoard || generateSudoku(restoreDifficulty)
              ),
              selected: null,
            },
          ]
        );
        setRemainingNumbers(saved.remainingNumbers ?? Array(9).fill(9));
        setMistakes(saved.mistakes ?? 0);
        setScore(saved.score ?? 0);
        if (scoreManager.current && typeof saved.score === "number") {
          scoreManager.current.setScore(saved.score);
        }
        setPreviousScore(saved.previousScore ?? 0);
        setCorrectStreak(saved.correctStreak ?? 0);
        setIsPausing(saved.isPausing ?? false);
        setRemainingHints(saved.remainingHints ?? 1);

        // If the restored difficulty is different, update parent
        if (saved.difficulty && saved.difficulty !== difficulty) {
          onDifficultyChange(saved.difficulty);
        }

        // Check if restored game should show game over dialog immediately
        if (
          settings.mistakeLimit &&
          (saved.mistakes ?? 0) >= SUDOKU_MISTAKE_LIMIT
        ) {
          console.log(
            "[Autosave] Restored game has too many mistakes, showing game over dialog"
          );
          // If mistakes are way over the limit, they might have used second chance already
          if ((saved.mistakes ?? 0) >= SUDOKU_MISTAKE_LIMIT * 2) {
            setHasUsedSecondChance(true);
          }
          setShowGameOverDialog(true);
        }

        console.log("[Autosave] Game state restored successfully");
      },
      [difficulty, onDifficultyChange, settings.mistakeLimit]
    );

    // --- Optimized AUTOSAVE LOGIC ---
    const currentGameStateRef = useRef(getCurrentGameState());

    // Update the ref whenever state changes
    useEffect(() => {
      const newState = getCurrentGameState();
      currentGameStateRef.current = newState;
      // Debug log for autosave state changes
      console.log("[Autosave] State updated:", {
        gameKey: `sudoku_${difficulty}`,
        hasBoard: !!newState.board,
        hasTimer: typeof newState.timer === "number",
        hasScore: typeof newState.score === "number",
        stateKeys: Object.keys(newState),
      });
    });

    // Cleanup autosave state when component unmounts or difficulty changes
    useEffect(() => {
      return () => {
        // Clear autosave state when component unmounts
        console.log(
          "[Autosave] Component unmounting, clearing autosave for:",
          `sudoku_${difficulty}`
        );
        clearAutosaveState(`sudoku_${difficulty}`).catch((error) => {
          console.error("Error clearing autosave on unmount:", error);
        });
      };
    }, [difficulty]);

    const { restoreState } = useGameAutosave({
      gameKey: `sudoku_${difficulty}`,
      state: currentGameStateRef.current,
      gameType: GameType.SUDOKU, // add this
      difficulty: difficulty, // add this
      level: 1, // add this (or some other default value)
      saveToCloud: userId
        ? (state) => uploadAutosaveStateToCloud(userId, state)
        : undefined,
      cloudInterval: 30000, // 30 seconds
      debounceDelay: 1000, // 1 second
    });

    // Modified restore on mount: only prompt if saved state exists
    useEffect(() => {
      async function checkRestore() {
        if (skipRestoreOnMount) {
          setHasCheckedAutosave(true);
          setIsLoading(false);
          return;
        }

        try {
          const restored = await restoreState();
          console.log("[Autosave] Restore check result:", {
            hasRestoredState: !!restored,
            restoredData: restored
              ? {
                  hasBoard: !!restored.board,
                  hasTimer: typeof restored.timer === "number",
                  hasScore: typeof restored.score === "number",
                  difficulty: restored.difficulty,
                }
              : null,
          });

          if (restored) {
            setPendingRestoreState(restored);
            setShowContinueDialog(true);
          }
        } catch (error) {
          console.error("Error checking for restore state:", error);
        } finally {
          setHasCheckedAutosave(true);
          setIsLoading(false);
        }
      }
      checkRestore();
    }, [restoreState, skipRestoreOnMount]);

    // Initialize a new game only when difficulty changes and not restoring
    useEffect(() => {
      if (!hasCheckedAutosave || showContinueDialog || restoredFromSave) return;

      console.log(
        "[Autosave] Initializing new game for difficulty:",
        difficulty
      );

      const newBoard = generateSudoku(difficulty);
      const cloned = deepClone(newBoard);
      setInitialBoard(cloned);
      setBoard(cloned);
      setSelectedCell(null);
      setSelectedNumber(null);
      setLockedNumber(null);
      setHistory([{ board: cloned, selected: null }]);
      setMistakes(0);
      setCorrectStreak(0);
      setScore(0);
      setPreviousScore(0);
      setIsPausing(false);
      setRemainingHints(1);
      setShowGameOverDialog(false);
      setHasUsedSecondChance(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);
      reset();
      setIsGameActive(true);

      console.log(
        "[Autosave] New game initialized for difficulty:",
        difficulty
      );
    }, [
      difficulty,
      hasCheckedAutosave,
      showContinueDialog,
      restoredFromSave,
      reset,
    ]);

    // Use settings to control mistake limit
    useEffect(() => {
      if (
        settings.mistakeLimit &&
        mistakes >= SUDOKU_MISTAKE_LIMIT &&
        !showGameOverDialog &&
        !hasUsedSecondChance &&
        !showContinueDialog &&
        !isPaused
      ) {
        console.log(
          "[Autosave] Game over due to mistakes, showing game over dialog for:",
          `sudoku_${difficulty}`
        );
        setShowGameOverDialog(true);
      }
    }, [
      mistakes,
      settings.mistakeLimit,
      showGameOverDialog,
      difficulty,
      hasUsedSecondChance,
      showContinueDialog,
      isPaused,
    ]);

    // Handle second chance logic - if second chance is used, allow one more mistake
    useEffect(() => {
      if (
        hasUsedSecondChance &&
        mistakes >= SUDOKU_MISTAKE_LIMIT &&
        !showGameOverDialog &&
        !showContinueDialog &&
        !isPaused
      ) {
        console.log(
          "[Autosave] Game over after second chance, showing final game over dialog for:",
          `sudoku_${difficulty}`
        );
        setShowGameOverDialog(true);
      }
    }, [
      hasUsedSecondChance,
      mistakes,
      showGameOverDialog,
      difficulty,
      showContinueDialog,
      isPaused,
    ]);

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
        console.log(
          "[Autosave] Game completed, clearing autosave for:",
          `sudoku_${difficulty}`
        );

        // Apply completion bonuses (perfect game, no hints, speed bonus)
        scoreManager.current.applyCompletionBonuses();
        setScore(scoreManager.current.getScore());

        // Clear autosave state when game is completed
        clearAutosaveState(`sudoku_${difficulty}`).catch((error) => {
          console.error("Error clearing autosave on completion:", error);
        });

        onComplete();
      }
    }, [board, onComplete, isGameCompleted, mistakes, difficulty]);

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
    }, [board, settings.showScore, score]);

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
      if (isGameComplete(board) || isPaused) return;

      if (remainingHints > 0) {
        // Use a hint
        let hint;
        if (selectedCell) {
          const [row, col] = selectedCell;
          const cell = board[row][col];

          if (cell.isFixed || (cell.value !== null && !cell.isError)) {
            showDialog(
              "Hint not needed",
              "This cell is already correctly filled.",
              [{ text: "OK", onPress: closeDialog, style: "default" }]
            );
            return;
          }

          hint = getHint(board, row, col);
        } else {
          hint = getHint(board);
        }

        if (!hint) {
          showDialog(
            "No hints available",
            "No valid hints found at this time.",
            [{ text: "OK", onPress: closeDialog, style: "default" }]
          );
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
        setRemainingHints((prev) => prev - 1); // Decrease remaining hints

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
      } else {
        // No free hints left, prompt to watch an ad
        showDialog(
          "Watch Ad for Hint",
          "You have used all your free hints. Watch an ad to get more hints.",
          [
            {
              text: "Watch Ad",
              style: "destructive",
              icon: "play",
              onPress: () => {
                // Simulate watching an ad
                setTimeout(() => {
                  showDialog("Ad Watched", "You have earned 1 more hint.", [
                    { text: "OK", onPress: closeDialog },
                  ]);
                  setRemainingHints((prev) => prev + 1);
                }, 2000); // Simulate ad duration
              },
            },
            { text: "Cancel", onPress: closeDialog, style: "cancel" },
          ]
        );
      }
    };

    // Define updateStreak function
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

    // Define removeRelatedNotes function
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
      console.log(
        "[Autosave] Restarting game, clearing autosave for:",
        `sudoku_${difficulty}`
      );

      // Clear autosave state when restarting
      clearAutosaveState(`sudoku_${difficulty}`).catch((error) => {
        console.error("Error clearing autosave on restart:", error);
      });

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
      setRemainingHints(1);
      reset();
      setIsPausing(false);
      setShowGameOverDialog(false);
      setHasUsedSecondChance(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);

      console.log("[Autosave] Game restarted successfully");
    }, [initialBoard, reset, difficulty]);

    // Game over dialog handlers
    const handleSecondChance = useCallback(() => {
      console.log("[Autosave] Second chance used, continuing game");
      setShowGameOverDialog(false);
      setHasUsedSecondChance(true);
      // Reset mistakes to allow one more mistake
      setMistakes(SUDOKU_MISTAKE_LIMIT - 1);
      // Clear autosave state when using second chance
      clearAutosaveState(`sudoku_${difficulty}`).catch((error) => {
        console.error("Error clearing autosave on second chance:", error);
      });
    }, [difficulty]);

    const handleGameOverRestart = useCallback(() => {
      console.log("[Autosave] Game over restart selected");
      setShowGameOverDialog(false);
      setHasUsedSecondChance(false);
      handleRestart();
    }, [handleRestart]);

    const handleGameOverNewGame = useCallback(async () => {
      console.log("[Autosave] Game over new game selected");
      setShowGameOverDialog(false);

      // Clear autosave state
      try {
        await clearAutosaveState(`sudoku_${difficulty}`);
      } catch (error) {
        console.error("Error clearing autosave:", error);
      }

      // Force a new game initialization
      const newBoard = generateSudoku(difficulty);
      const cloned = deepClone(newBoard);
      setInitialBoard(cloned);
      setBoard(cloned);
      setSelectedCell(null);
      setSelectedNumber(null);
      setLockedNumber(null);
      setHistory([{ board: cloned, selected: null }]);
      setMistakes(0);
      setCorrectStreak(0);
      setScore(0);
      setPreviousScore(0);
      setIsPausing(false);
      setRemainingHints(1);
      setShowGameOverDialog(false);
      setHasUsedSecondChance(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);
      reset();

      console.log("[Autosave] New game initialized after game over");
    }, [difficulty, reset]);

    // Expose restart to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        restart: handleRestart,
      }),
      [handleRestart]
    );

    const isLandscape = orientation === "landscape";

    // Define fontSizes mapping
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
        gap: currentTheme.spacing.small,
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
        marginTop: 0,
      },
      landscapeControls: {
        width: "40%",
        maxWidth: 300,
      },
    });

    // Handler for dialog actions
    const handleContinue = async () => {
      console.log("[Autosave] Continuing from saved state:", {
        hasPendingState: !!pendingRestoreState,
        pendingStateKeys: pendingRestoreState
          ? Object.keys(pendingRestoreState)
          : [],
      });

      if (pendingRestoreState) {
        setRestoredFromSave(true);
        restoreGameState(pendingRestoreState);

        // Properly restore timer state
        if (typeof pendingRestoreState.timer === "number") {
          console.log("[Autosave] Restoring timer:", pendingRestoreState.timer);
          reset(pendingRestoreState.timer);
          // Start timer if it was running before
          if (pendingRestoreState.isPausing === false && settings.timer) {
            console.log("[Autosave] Starting timer after restore");
            start();
          }
        }

        setPendingRestoreState(null);
      }
      setShowContinueDialog(false);
      setIsGameActive(true);

      // Check if the restored game should show game over dialog immediately
      if (
        pendingRestoreState &&
        settings.mistakeLimit &&
        (pendingRestoreState.mistakes ?? 0) >= SUDOKU_MISTAKE_LIMIT
      ) {
        console.log(
          "[Autosave] Restored game has too many mistakes, showing game over dialog after continue"
        );
        setShowGameOverDialog(true);
      }
    };

    const handleNewGame = async () => {
      console.log(
        "[Autosave] Starting new game, clearing autosave for:",
        `sudoku_${difficulty}`
      );

      // Clear autosave for this game
      try {
        await clearAutosaveState(`sudoku_${difficulty}`);
        console.log("[Autosave] Successfully cleared autosave for new game");
      } catch (error) {
        console.error("Error clearing autosave:", error);
      }

      setShowContinueDialog(false);
      setRestoredFromSave(false);
      setPendingRestoreState(null);
      setIsGameActive(true);

      // Force a new game initialization
      const newBoard = generateSudoku(difficulty);
      const cloned = deepClone(newBoard);
      setInitialBoard(cloned);
      setBoard(cloned);
      setSelectedCell(null);
      setSelectedNumber(null);
      setLockedNumber(null);
      setHistory([{ board: cloned, selected: null }]);
      setMistakes(0);
      setCorrectStreak(0);
      setScore(0);
      setPreviousScore(0);
      setIsPausing(false);
      setRemainingHints(1);
      setShowGameOverDialog(false);
      setHasUsedSecondChance(false);
      scoreManager.current = new ScoreManager(GameType.SUDOKU, difficulty);
      reset();

      console.log("[Autosave] New game initialized successfully");
    };

    // Add dialog state and helper functions at the top level of the component
    interface DialogButton {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
      icon?: string; // Optional icon name for button
    }

    interface DialogState {
      visible: boolean;
      title: string;
      message: string;
      buttons: DialogButton[];
    }

    const [dialogState, setDialogState] = useState<DialogState>({
      visible: false,
      title: "",
      message: "",
      buttons: [],
    });

    const showDialog = (
      title: string,
      message: string,
      buttons: Array<{
        text: string;
        onPress: () => void;
        style?: "default" | "cancel" | "destructive";
        icon?: string; // Optional icon name for button
      }>
    ) => {
      setDialogState({ visible: true, title, message, buttons });
    };

    const closeDialog = () => {
      setDialogState({ ...dialogState, visible: false });
    };

    // Show loader while loading saved progress
    if (isLoading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000010",
          }}
        >
          <ActivityIndicator size="large" color="#A78BFA" />
        </View>
      );
    }

    // Only render the prompt if it's visible, block all game UI
    if (showContinueDialog) {
      return (
        <FullScreenPrompt
          visible={showContinueDialog}
          gameName={title}
          timer={pendingRestoreState?.timer}
          difficulty={pendingRestoreState?.difficulty}
          onContinue={handleContinue}
          onNewGame={handleNewGame}
        />
      );
    }

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
          settings={updatedSettings} // Pass updated settings
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
            settings={updatedSettings} // Pass updated settings
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
            settings={updatedSettings} // Pass updated settings
            badgeCount={remainingHints} // Show remaining hints
            numpadFontSize={fontSizes.numpad}
          />
        </View>
        <Dialog
          visible={dialogState.visible || showGameOverDialog}
          title={
            showGameOverDialog
              ? hasUsedSecondChance
                ? "Game Over"
                : "Mistake Limit Reached"
              : dialogState.title
          }
          message={
            showGameOverDialog
              ? hasUsedSecondChance
                ? `You've reached the mistake limit again. Would you like to restart or start a new game?`
                : `You've made ${mistakes} mistakes. Would you like to use a second chance, restart, or start a new game?`
              : dialogState.message
          }
          buttons={
            showGameOverDialog
              ? hasUsedSecondChance
                ? [
                    {
                      text: "Restart",
                      onPress: handleGameOverRestart,
                      style: "default",
                    },
                    {
                      text: "New Game",
                      onPress: handleGameOverNewGame,
                      style: "destructive",
                    },
                  ]
                : [
                    {
                      text: "Second Chance", // Dialog should render play icon for this button
                      onPress: handleSecondChance,
                      style: "destructive",
                      icon: "play",
                    },
                    {
                      text: "Restart",
                      onPress: handleGameOverRestart,
                      style: "default",
                    },
                    {
                      text: "New Game",
                      onPress: handleGameOverNewGame,
                      style: "default",
                    },
                  ]
              : dialogState.buttons
          }
          onDismiss={() => {
            if (showGameOverDialog) setShowGameOverDialog(false);
            else closeDialog();
          }}
        />
      </View>
    );
  }
);

export default SudokuGame;
