import { Difficulty, WordSearchLevel, WordSearchCell, WordSearchWord } from '../../../types';
import { shuffleArray } from '../../../utils/helpers';

// List of words for the word search puzzle
const easyWords = [
  'CAT', 'DOG', 'RUN', 'SUN', 'FUN', 'HAT', 'MAP', 'RED',
  'BUG', 'LOG', 'JAM', 'PEN', 'TOP', 'ZIP', 'BUS', 'BOX'
];

const mediumWords = [
  'APPLE', 'BEACH', 'CLOUD', 'DREAM', 'EARTH', 'FLAME',
  'GRAPE', 'HOUSE', 'JUMBO', 'LIGHT', 'MUSIC', 'NIGHT',
  'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'SOLID', 'TIGER'
];

const hardWords = [
  'JOURNEY', 'DIAMOND', 'WHISPER', 'KINGDOM', 'PHANTOM',
  'VICTORY', 'MYSTERY', 'QUANTUM', 'HARMONY', 'CRYSTAL',
  'FREEDOM', 'ECLIPSE', 'HORIZON', 'PHOENIX', 'SILENCE'
];

// Direction mappings
const directions = [
  'horizontal',
  'vertical',
  'diagonal-right',
  'diagonal-left',
  'horizontal-reverse',
  'vertical-reverse',
  'diagonal-right-reverse',
  'diagonal-left-reverse'
];

/**
 * Generate a word search level based on difficulty
 */
export const generateWordSearchLevel = (difficulty: Difficulty): WordSearchLevel => {
  // Determine grid size and word list based on difficulty
  let gridSize: number;
  let words: string[];
  let numWords: number;
  
  switch (difficulty) {
    case Difficulty.EASY:
      gridSize = 8;
      words = [...easyWords];
      numWords = 6;
      break;
    case Difficulty.MEDIUM:
      gridSize = 10;
      words = [...mediumWords];
      numWords = 8;
      break;
    case Difficulty.HARD:
      gridSize = 12;
      words = [...hardWords];
      numWords = 10;
      break;
    default:
      gridSize = 8;
      words = [...easyWords];
      numWords = 6;
  }
  
  // Shuffle words and select subset
  const selectedWords = shuffleArray(words).slice(0, numWords);
  
  // Create empty board
  let board: WordSearchCell[][] = Array(gridSize).fill(0).map((_, rowIndex) => 
    Array(gridSize).fill(0).map((_, colIndex) => ({
      letter: '',
      row: rowIndex,
      col: colIndex,
      isSelected: false,
      isHighlighted: false,
      isFound: false
    }))
  );
  
  // Place words on the board
  const placedWords: WordSearchWord[] = [];
  
  for (const word of selectedWords) {
    const result = placeWordOnBoard(board, word, gridSize);
    if (result) {
      const { row, col, direction } = result;
      placedWords.push({
        word,
        row,
        col,
        direction,
        isFound: false
      });
    }
  }
  
  // Fill remaining cells with random letters
  board = fillRemainingCells(board);
  
  return {
    size: gridSize,
    board,
    words: placedWords
  };
};

/**
 * Try to place a word on the board
 */
const placeWordOnBoard = (
  board: WordSearchCell[][], 
  word: string, 
  gridSize: number
): { row: number; col: number; direction: string } | null => {
  // Shuffle directions for random placement
  const shuffledDirections = shuffleArray([...directions]);
  
  // Try each direction
  for (const direction of shuffledDirections) {
    // Try 10 random positions
    for (let attempts = 0; attempts < 10; attempts++) {
      const { row, col, canPlace } = canPlaceWordAt(board, word, direction, gridSize);
      
      if (canPlace) {
        placeWord(board, word, row, col, direction);
        return { row, col, direction };
      }
    }
  }
  
  return null;
};

/**
 * Check if a word can be placed at a random position in a given direction
 */
const canPlaceWordAt = (
  board: WordSearchCell[][], 
  word: string, 
  direction: string, 
  gridSize: number
): { row: number; col: number; canPlace: boolean } => {
  // Generate random starting position
  let row: number, col: number;
  
  // Get direction steps
  const { rowStep, colStep } = getDirectionSteps(direction);
  
  // Calculate max starting positions based on word length and direction
  const wordLength = word.length;
  const rowLimit = gridSize - (rowStep * wordLength);
  const colLimit = gridSize - (colStep * wordLength);
  
  // Adjust random position based on direction
  if (rowStep > 0) {
    row = Math.floor(Math.random() * rowLimit);
  } else if (rowStep < 0) {
    row = Math.floor(Math.random() * (gridSize - rowLimit)) + rowLimit;
  } else {
    row = Math.floor(Math.random() * gridSize);
  }
  
  if (colStep > 0) {
    col = Math.floor(Math.random() * colLimit);
  } else if (colStep < 0) {
    col = Math.floor(Math.random() * (gridSize - colLimit)) + colLimit;
  } else {
    col = Math.floor(Math.random() * gridSize);
  }
  
  // Check if word can be placed
  let canPlace = true;
  let currentRow = row;
  let currentCol = col;
  
  for (let i = 0; i < wordLength; i++) {
    // Check if cell is out of bounds
    if (
      currentRow < 0 || 
      currentRow >= gridSize || 
      currentCol < 0 || 
      currentCol >= gridSize
    ) {
      canPlace = false;
      break;
    }
    
    // Check if cell is empty or has the same letter
    if (board[currentRow][currentCol].letter !== '' && 
        board[currentRow][currentCol].letter !== word[i]) {
      canPlace = false;
      break;
    }
    
    // Move to next cell
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return { row, col, canPlace };
};

/**
 * Place a word on the board in the specified direction
 */
const placeWord = (
  board: WordSearchCell[][], 
  word: string, 
  startRow: number, 
  startCol: number, 
  direction: string
): void => {
  const { rowStep, colStep } = getDirectionSteps(direction);
  let currentRow = startRow;
  let currentCol = startCol;
  
  for (let i = 0; i < word.length; i++) {
    board[currentRow][currentCol].letter = word[i];
    currentRow += rowStep;
    currentCol += colStep;
  }
};

/**
 * Get row and column step values for a given direction
 */
const getDirectionSteps = (direction: string): { rowStep: number; colStep: number } => {
  switch (direction) {
    case 'horizontal':
      return { rowStep: 0, colStep: 1 };
    case 'horizontal-reverse':
      return { rowStep: 0, colStep: -1 };
    case 'vertical':
      return { rowStep: 1, colStep: 0 };
    case 'vertical-reverse':
      return { rowStep: -1, colStep: 0 };
    case 'diagonal-right':
      return { rowStep: 1, colStep: 1 };
    case 'diagonal-left':
      return { rowStep: 1, colStep: -1 };
    case 'diagonal-right-reverse':
      return { rowStep: -1, colStep: 1 };
    case 'diagonal-left-reverse':
      return { rowStep: -1, colStep: -1 };
    default:
      return { rowStep: 0, colStep: 0 };
  }
};

/**
 * Fill remaining empty cells with random letters
 */
const fillRemainingCells = (board: WordSearchCell[][]): WordSearchCell[][] => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  return board.map(row => 
    row.map(cell => {
      if (cell.letter === '') {
        return {
          ...cell,
          letter: letters.charAt(Math.floor(Math.random() * letters.length))
        };
      }
      return cell;
    })
  );
};