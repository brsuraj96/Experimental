import { SudokuBoard, SudokuCell, Difficulty } from "../../../types";
import { deepClone } from "../../../utils/helpers";

/**
 * Generate a solved Sudoku board
 */
const generateSolvedBoard = (): (number | null)[][] => {
  // Start with an empty 9x9 board
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  // Recursively fill the board
  if (solveSudoku(board)) {
    return board;
  }

  // If solving fails, return an empty board (should never happen)
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
};

/**
 * Solve a Sudoku board using backtracking
 */
const solveSudoku = (board: (number | null)[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Find an empty cell
      if (board[row][col] === null) {
        // Try digits 1-9
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        // Shuffle numbers for randomness
        for (let i = numbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        for (const num of numbers) {
          // Check if valid
          if (isValid(board, row, col, num)) {
            board[row][col] = num;

            // Recursively solve the rest
            if (solveSudoku(board)) {
              return true;
            }

            // If not solvable with this number, backtrack
            board[row][col] = null;
          }
        }

        // No valid solution found
        return false;
      }
    }
  }

  // All cells filled
  return true;
};

/**
 * Check if a number is valid in a specific position
 */
const isValid = (
  board: (number | null)[][],
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Remove cells to create a puzzle with a specific difficulty
 */
const createPuzzle = (
  solvedBoard: (number | null)[][],
  difficulty: Difficulty
): SudokuBoard => {
  // Convert to Sudoku cells format
  const board: SudokuBoard = solvedBoard.map((row) =>
    row.map((value) => ({
      value,
      isFixed: true,
      isError: false,
      notes: Array(9).fill(false),
    }))
  );

  // Determine how many cells to remove based on difficulty
  const removeCounts = {
    [Difficulty.BEGINNER]: 30,
    [Difficulty.EASY]: 36,
    [Difficulty.MEDIUM]: 46,
    [Difficulty.HARD]: 52,
    [Difficulty.EXPERT]: 58,
  };
  const cellsToRemove = removeCounts[difficulty] || 36;

  // Create a list of all cell positions
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle the positions to randomize removal
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove cells one by one, ensuring the puzzle still has a unique solution
  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;

    const originalValue = board[row][col].value;
    board[row][col].value = null;
    board[row][col].isFixed = false;

    // For harder difficulties, we can skip the uniqueness check
    if (difficulty === Difficulty.HARD || hasUniqueSolution(board)) {
      removed++;
    } else {
      // If removing this cell creates multiple solutions, put it back
      board[row][col].value = originalValue;
      board[row][col].isFixed = true;
    }
  }

  return board;
};

/**
 * Check if a puzzle has a unique solution
 * This is a simplified check that's sufficient for most puzzles
 */
const hasUniqueSolution = (board: SudokuBoard): boolean => {
  // Convert to simple number format for solver
  const numericBoard = board.map((row) => row.map((cell) => cell.value));

  // Try to find a solution
  const solutions = countSolutions(numericBoard, 2);
  return solutions === 1;
};

/**
 * Count solutions for a board up to a limit
 */
const countSolutions = (board: (number | null)[][], limit: number): number => {
  const cell = findEmptyCell(board);
  if (!cell) return 1; // No empty cells, we found a solution

  const [row, col] = cell;
  let count = 0;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      count += countSolutions(board, limit - count);
      board[row][col] = null; // Backtrack

      if (count >= limit) break; // Stop once we hit the limit
    }
  }

  return count;
};

/**
 * Find an empty cell in the board
 */
const findEmptyCell = (board: (number | null)[][]): [number, number] | null => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        return [row, col];
      }
    }
  }
  return null;
};

/**
 * Generate a complete Sudoku puzzle
 */
export const generateSudoku = (difficulty: Difficulty): SudokuBoard => {
  const solvedBoard = generateSolvedBoard();
  return createPuzzle(solvedBoard, difficulty);
};

/**
 * Validate if a move is valid in the current board state
 */
export const validateSudoku = (
  board: SudokuBoard,
  row: number,
  col: number
): boolean => {
  const value = board[row][col].value;
  if (value === null) return true;

  // Create a numeric version of the board for validation
  const numericBoard = board.map((r) => r.map((cell) => cell.value));

  // Temporarily remove the value to check if it's valid
  numericBoard[row][col] = null;

  return isValid(numericBoard as (number | null)[][], row, col, value);
};

/**
 * Check if the game is complete
 */
export const isGameComplete = (board: SudokuBoard): boolean => {
  // Check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = board[row][col];
      if (cell.value === null || cell.isError) {
        return false;
      }
    }
  }

  // All cells are filled, check if the solution is valid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!validateSudoku(board, row, col)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Get a hint for the current board state
 * @param board The current Sudoku board
 * @param rowHint Optional row to get hint for specific cell
 * @param colHint Optional col to get hint for specific cell
 * @returns An object with row, col, and value for the hint
 */
export const getHint = (
  board: SudokuBoard,
  rowHint?: number,
  colHint?: number
): { row: number; col: number; value: number } | null => {
  // Create a numeric version of the board
  const numericBoard = board.map((r) => r.map((cell) => cell.value));

  // Try to solve the board
  const solvedBoard = [...numericBoard.map((r) => [...r])];
  if (solveSudoku(solvedBoard as (number | null)[][])) {
    // If specific cell requested
    if (rowHint !== undefined && colHint !== undefined) {
      if (numericBoard[rowHint][colHint] === null) {
        return {
          row: rowHint,
          col: colHint,
          value: solvedBoard[rowHint][colHint] as number,
        };
      }
      return null;
    }

    // Find any empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (numericBoard[row][col] === null && solvedBoard[row][col] !== null) {
          return {
            row,
            col,
            value: solvedBoard[row][col] as number,
          };
        }
      }
    }
  }

  return null;
};
