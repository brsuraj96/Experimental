import { SlideTileBoard, SlideTilePosition, Difficulty } from '../../../types';

/**
 * Get the board size based on difficulty
 */
export const getBoardSize = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case Difficulty.EASY:
      return 3; // 3x3 board
    case Difficulty.MEDIUM:
      return 4; // 4x4 board
    case Difficulty.HARD:
      return 5; // 5x5 board
    default:
      return 3;
  }
};

/**
 * Generate a solved board
 */
export const generateBoard = (size: number): SlideTileBoard => {
  const board: SlideTileBoard = [];
  let value = 1;
  
  for (let row = 0; row < size; row++) {
    const newRow: number[] = [];
    for (let col = 0; col < size; col++) {
      // The last tile is empty (0)
      newRow.push((row === size - 1 && col === size - 1) ? 0 : value++);
    }
    board.push(newRow);
  }
  
  return board;
};

/**
 * Shuffle the board by making random valid moves
 */
export const shuffleBoard = (board: SlideTileBoard): SlideTileBoard => {
  // Make a deep copy of the board
  const newBoard: SlideTileBoard = JSON.parse(JSON.stringify(board));
  const size = newBoard.length;
  
  // Find the empty tile
  const emptyPos = findEmptyTile(newBoard);
  
  // Make a series of random valid moves
  const moves = size * size * 20; // Number of random moves to make
  
  for (let i = 0; i < moves; i++) {
    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
    ];
    
    // Shuffle directions
    for (let j = directions.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [directions[j], directions[k]] = [directions[k], directions[j]];
    }
    
    // Try each direction until a valid move is found
    for (const direction of directions) {
      const newRow = emptyPos.row + direction.row;
      const newCol = emptyPos.col + direction.col;
      
      if (isValidPosition(newRow, newCol, size)) {
        // Swap the empty tile with the tile in the direction
        newBoard[emptyPos.row][emptyPos.col] = newBoard[newRow][newCol];
        newBoard[newRow][newCol] = 0;
        
        // Update empty position
        emptyPos.row = newRow;
        emptyPos.col = newCol;
        break;
      }
    }
  }
  
  // Ensure the puzzle is solvable
  if (!isSolvable(newBoard)) {
    // If not solvable, swap any two adjacent non-empty tiles
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - 1; col++) {
        if (newBoard[row][col] !== 0 && newBoard[row][col + 1] !== 0) {
          const temp = newBoard[row][col];
          newBoard[row][col] = newBoard[row][col + 1];
          newBoard[row][col + 1] = temp;
          return newBoard;
        }
      }
    }
  }
  
  return newBoard;
};

/**
 * Check if a puzzle is solvable
 * For odd board sizes, puzzle is solvable if the number of inversions is even
 * For even board sizes, puzzle is solvable if:
 * - the empty tile is on an even row (from bottom) and inversions are odd, or
 * - the empty tile is on an odd row (from bottom) and inversions are even
 */
const isSolvable = (board: SlideTileBoard): boolean => {
  const size = board.length;
  const flatBoard: number[] = [];
  let emptyRow = 0;
  
  // Flatten the board and find the empty tile row
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      flatBoard.push(board[row][col]);
      if (board[row][col] === 0) {
        emptyRow = row;
      }
    }
  }
  
  // Count inversions
  let inversions = 0;
  for (let i = 0; i < flatBoard.length - 1; i++) {
    if (flatBoard[i] === 0) continue;
    
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[j] !== 0 && flatBoard[i] > flatBoard[j]) {
        inversions++;
      }
    }
  }
  
  // Check solvability based on board size
  if (size % 2 === 1) {
    // Odd board size
    return inversions % 2 === 0;
  } else {
    // Even board size
    const emptyRowFromBottom = size - emptyRow;
    return (emptyRowFromBottom % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0);
  }
};

/**
 * Find the position of the empty tile (0)
 */
export const findEmptyTile = (board: SlideTileBoard): SlideTilePosition => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        return { row, col };
      }
    }
  }
  // This should never happen with a valid board
  return { row: 0, col: 0 };
};

/**
 * Check if a position is valid on the board
 */
export const isValidPosition = (row: number, col: number, size: number): boolean => {
  return row >= 0 && row < size && col >= 0 && col < size;
};

/**
 * Check if a tile can be moved (adjacent to empty tile)
 */
export const canMoveTile = (board: SlideTileBoard, row: number, col: number): boolean => {
  const emptyPos = findEmptyTile(board);
  
  // A tile can move if it's adjacent to the empty tile
  return (
    (Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
    (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row)
  );
};

/**
 * Move a tile to the empty position if possible
 */
export const moveTile = (board: SlideTileBoard, row: number, col: number): SlideTileBoard => {
  if (!canMoveTile(board, row, col)) {
    return board;
  }
  
  // Create a deep copy of the board
  const newBoard: SlideTileBoard = JSON.parse(JSON.stringify(board));
  const emptyPos = findEmptyTile(newBoard);
  
  // Swap the selected tile with the empty tile
  newBoard[emptyPos.row][emptyPos.col] = newBoard[row][col];
  newBoard[row][col] = 0;
  
  return newBoard;
};

/**
 * Check if the puzzle is solved
 */
export const isSolved = (board: SlideTileBoard): boolean => {
  const size = board.length;
  let value = 1;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Last position should be empty (0)
      if (row === size - 1 && col === size - 1) {
        if (board[row][col] !== 0) return false;
      } 
      // All other positions should have the correct sequential value
      else if (board[row][col] !== value) {
        return false;
      }
      value++;
    }
  }
  
  return true;
};
