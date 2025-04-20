import { Difficulty, CrosswordLevel, CrosswordBoard, CrosswordCell, CrosswordClue } from '../../../types';

// Pre-defined crossword puzzles for each difficulty level
const easyCrosswords: CrosswordLevel[] = [
  {
    size: 5,
    board: [],
    acrossClues: [
      { number: 1, text: 'Puzzle solving container', direction: 'across', row: 0, col: 0, length: 3, answer: 'BOX' },
      { number: 3, text: 'Opposite of stop', direction: 'across', row: 2, col: 0, length: 5, answer: 'START' },
      { number: 5, text: 'Tool to write with', direction: 'across', row: 4, col: 0, length: 3, answer: 'PEN' }
    ],
    downClues: [
      { number: 1, text: 'To float on water', direction: 'down', row: 0, col: 0, length: 4, answer: 'BOAT' },
      { number: 2, text: 'Tree fruit', direction: 'down', row: 0, col: 2, length: 5, answer: 'APPLE' },
      { number: 4, text: 'Frozen water', direction: 'down', row: 2, col: 4, length: 3, answer: 'ICE' }
    ]
  }
];

const mediumCrosswords: CrosswordLevel[] = [
  {
    size: 7,
    board: [],
    acrossClues: [
      { number: 1, text: 'Small rodent', direction: 'across', row: 0, col: 0, length: 5, answer: 'MOUSE' },
      { number: 4, text: 'Digital pictures', direction: 'across', row: 2, col: 0, length: 7, answer: 'IMAGES' },
      { number: 6, text: 'Programming language', direction: 'across', row: 4, col: 0, length: 4, answer: 'CODE' },
      { number: 7, text: 'Data display', direction: 'across', row: 6, col: 0, length: 6, answer: 'SCREEN' }
    ],
    downClues: [
      { number: 1, text: 'Internet protocol', direction: 'down', row: 0, col: 0, length: 4, answer: 'MAIL' },
      { number: 2, text: 'Used for clicking', direction: 'down', row: 0, col: 2, length: 7, answer: 'USECASE' },
      { number: 3, text: 'Computing devices', direction: 'down', row: 0, col: 4, length: 7, answer: 'ENGINES' },
      { number: 5, text: 'Used for data', direction: 'down', row: 2, col: 6, length: 5, answer: 'STORE' }
    ]
  }
];

const hardCrosswords: CrosswordLevel[] = [
  {
    size: 9,
    board: [],
    acrossClues: [
      { number: 1, text: 'Data structure', direction: 'across', row: 0, col: 0, length: 5, answer: 'ARRAY' },
      { number: 4, text: 'Stores information', direction: 'across', row: 2, col: 0, length: 8, answer: 'DATABASE' },
      { number: 6, text: 'Web styling', direction: 'across', row: 4, col: 0, length: 3, answer: 'CSS' },
      { number: 7, text: 'Device memory', direction: 'across', row: 6, col: 0, length: 3, answer: 'RAM' },
      { number: 8, text: 'Mobile app framework', direction: 'across', row: 8, col: 0, length: 9, answer: 'REACTNATIVE' }
    ],
    downClues: [
      { number: 1, text: 'Language for web', direction: 'down', row: 0, col: 0, length: 9, answer: 'ALGORITHM' },
      { number: 2, text: 'Finding errors', direction: 'down', row: 0, col: 2, length: 5, answer: 'REDUX' },
      { number: 3, text: 'Wireless technology', direction: 'down', row: 0, col: 4, length: 9, answer: 'YIELDABLE' },
      { number: 5, text: 'Computer system', direction: 'down', row: 2, col: 7, length: 7, answer: 'ELEMENT' }
    ]
  }
];

/**
 * Initialize a crossword board based on the clues
 */
const initializeBoard = (level: CrosswordLevel): CrosswordBoard => {
  const { size, acrossClues, downClues } = level;
  
  // Create an empty board with blank cells
  const board: CrosswordBoard = Array(size).fill(null).map((_, rowIndex) => 
    Array(size).fill(null).map((_, colIndex) => ({
      letter: '',
      userLetter: '',
      isBlank: true,
      row: rowIndex,
      col: colIndex
    }))
  );
  
  // Fill in the cells for across clues
  acrossClues.forEach(clue => {
    const { row, col, length, number, answer } = clue;
    for (let i = 0; i < length; i++) {
      board[row][col + i] = {
        letter: answer[i],
        userLetter: '',
        isBlank: false,
        number: i === 0 ? number : undefined,
        row,
        col: col + i
      };
    }
  });
  
  // Fill in the cells for down clues
  downClues.forEach(clue => {
    const { row, col, length, number, answer } = clue;
    for (let i = 0; i < length; i++) {
      // If the cell is already filled (intersection of across and down)
      // we don't want to overwrite the number
      const existingCell = board[row + i][col];
      board[row + i][col] = {
        letter: answer[i],
        userLetter: '',
        isBlank: false,
        // Preserve the existing number if there is one
        number: i === 0 ? (existingCell.number || number) : existingCell.number,
        row: row + i,
        col
      };
    }
  });
  
  return board;
};

/**
 * Generate a new crossword level based on difficulty
 */
export const generateLevel = (difficulty: Difficulty): CrosswordLevel => {
  let levels: CrosswordLevel[];
  
  switch (difficulty) {
    case Difficulty.EASY:
      levels = easyCrosswords;
      break;
    case Difficulty.MEDIUM:
      levels = mediumCrosswords;
      break;
    case Difficulty.HARD:
      levels = hardCrosswords;
      break;
    default:
      levels = easyCrosswords;
  }
  
  // Select a random level from the available ones
  const levelIndex = Math.floor(Math.random() * levels.length);
  const level = { ...levels[levelIndex] };
  
  // Initialize the board for the selected level
  level.board = initializeBoard(level);
  
  return level;
};

/**
 * Check if a letter is valid for a cell
 */
export const isLetterValid = (board: CrosswordBoard, row: number, col: number, letter: string): boolean => {
  return board[row][col].letter.toUpperCase() === letter.toUpperCase();
};

/**
 * Update a cell with the user's letter
 */
export const updateCell = (
  board: CrosswordBoard,
  row: number,
  col: number,
  letter: string
): CrosswordBoard => {
  const newBoard = [...board];
  newBoard[row] = [...board[row]];
  newBoard[row][col] = {
    ...newBoard[row][col],
    userLetter: letter.toUpperCase(),
    isError: letter !== '' && !isLetterValid(board, row, col, letter)
  };
  return newBoard;
};

/**
 * Check if the crossword is completed correctly
 */
export const isCrosswordComplete = (board: CrosswordBoard): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];
      if (!cell.isBlank && (cell.userLetter === '' || cell.letter.toUpperCase() !== cell.userLetter.toUpperCase())) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Get the next cell in the given direction
 */
export const getNextCell = (
  board: CrosswordBoard,
  row: number,
  col: number,
  direction: 'across' | 'down'
): { row: number; col: number } | null => {
  const size = board.length;
  let nextRow = row;
  let nextCol = col;
  
  if (direction === 'across') {
    nextCol++;
    while (nextCol < size) {
      if (!board[nextRow][nextCol].isBlank) {
        return { row: nextRow, col: nextCol };
      }
      nextCol++;
    }
  } else {
    nextRow++;
    while (nextRow < size) {
      if (!board[nextRow][col].isBlank) {
        return { row: nextRow, col };
      }
      nextRow++;
    }
  }
  
  return null;
};

/**
 * Get the previous cell in the given direction
 */
export const getPrevCell = (
  board: CrosswordBoard,
  row: number,
  col: number,
  direction: 'across' | 'down'
): { row: number; col: number } | null => {
  let prevRow = row;
  let prevCol = col;
  
  if (direction === 'across') {
    prevCol--;
    while (prevCol >= 0) {
      if (!board[prevRow][prevCol].isBlank) {
        return { row: prevRow, col: prevCol };
      }
      prevCol--;
    }
  } else {
    prevRow--;
    while (prevRow >= 0) {
      if (!board[prevRow][col].isBlank) {
        return { row: prevRow, col };
      }
      prevRow--;
    }
  }
  
  return null;
};

/**
 * Get the clue for the given cell and direction
 */
export const getClueForCell = (
  level: CrosswordLevel,
  row: number,
  col: number,
  direction: 'across' | 'down'
): CrosswordClue | null => {
  const clues = direction === 'across' ? level.acrossClues : level.downClues;
  
  // For across clues, we need to backtrack to the beginning of the word
  if (direction === 'across') {
    let startCol = col;
    while (startCol > 0 && !level.board[row][startCol - 1].isBlank) {
      startCol--;
    }
    
    // Find the clue that starts at this position
    return clues.find(clue => clue.row === row && clue.col === startCol) || null;
  } 
  // For down clues, backtrack to the beginning of the word
  else {
    let startRow = row;
    while (startRow > 0 && !level.board[startRow - 1][col].isBlank) {
      startRow--;
    }
    
    // Find the clue that starts at this position
    return clues.find(clue => clue.row === startRow && clue.col === col) || null;
  }
};

/**
 * Get all cells that are part of the current clue
 */
export const getCellsForClue = (
  level: CrosswordLevel,
  clue: CrosswordClue
): { row: number; col: number }[] => {
  const cells: { row: number; col: number }[] = [];
  const { row, col, length, direction } = clue;
  
  for (let i = 0; i < length; i++) {
    if (direction === 'across') {
      cells.push({ row, col: col + i });
    } else {
      cells.push({ row: row + i, col });
    }
  }
  
  return cells;
};

/**
 * Highlight all cells that are part of the current clue
 */
export const highlightCellsForClue = (
  board: CrosswordBoard,
  clue: CrosswordClue | null
): CrosswordBoard => {
  if (!clue) return board;
  
  const newBoard = board.map(row => 
    row.map(cell => ({ ...cell, isHighlighted: false }))
  );
  
  const { row, col, length, direction } = clue;
  
  for (let i = 0; i < length; i++) {
    if (direction === 'across') {
      newBoard[row][col + i].isHighlighted = true;
    } else {
      newBoard[row + i][col].isHighlighted = true;
    }
  }
  
  return newBoard;
};

/**
 * Provide a hint for the current position by filling in the correct letter
 */
export const getHint = (
  board: CrosswordBoard,
  row: number,
  col: number
): CrosswordBoard => {
  if (board[row][col].isBlank) return board;
  
  const newBoard = [...board];
  newBoard[row] = [...board[row]];
  newBoard[row][col] = {
    ...board[row][col],
    userLetter: board[row][col].letter.toUpperCase(),
    isError: false
  };
  
  return newBoard;
};