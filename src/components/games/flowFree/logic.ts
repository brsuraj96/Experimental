import { FlowBoard, FlowLevel, FlowColor, FlowPoint, Difficulty } from '../../../types';
import { deepClone } from '../../../utils/helpers';

// Available colors for flow paths
const COLORS: FlowColor[] = [
  FlowColor.RED,
  FlowColor.BLUE,
  FlowColor.GREEN,
  FlowColor.YELLOW,
  FlowColor.PURPLE,
  FlowColor.ORANGE,
  FlowColor.PINK,
  FlowColor.CYAN,
  FlowColor.LIME,
  FlowColor.TEAL,
];

/**
 * Generate a new flow free level based on difficulty
 */
export const generateLevel = (difficulty: Difficulty): FlowLevel => {
  let size: number;
  let pairCount: number;

  // Set board size and number of color pairs based on difficulty
  switch (difficulty) {
    case Difficulty.EASY:
      size = 5;
      pairCount = 4;
      break;
    case Difficulty.MEDIUM:
      size = 6;
      pairCount = 5;
      break;
    case Difficulty.HARD:
      size = 7;
      pairCount = 6;
      break;
    default:
      size = 5;
      pairCount = 4;
  }

  // Make sure we don't exceed available colors
  pairCount = Math.min(pairCount, COLORS.length);

  const endpoints: { row: number; col: number; color: FlowColor }[] = [];
  
  // Place color pairs randomly on the board
  for (let i = 0; i < pairCount; i++) {
    // Get a set of unique positions for each color pair
    const positions = getRandomPositions(size, endpoints);
    
    // Add two endpoints for this color
    endpoints.push({
      row: positions[0].row,
      col: positions[0].col,
      color: COLORS[i],
    });
    
    endpoints.push({
      row: positions[1].row,
      col: positions[1].col,
      color: COLORS[i],
    });
  }

  return {
    size,
    endpoints,
  };
};

/**
 * Get random positions for a color pair
 */
const getRandomPositions = (
  size: number,
  existingEndpoints: { row: number; col: number; color: FlowColor }[]
): { row: number; col: number }[] => {
  const positions: { row: number; col: number }[] = [];
  const occupiedPositions = new Set(
    existingEndpoints.map((ep) => `${ep.row},${ep.col}`)
  );

  // Function to check if a position is valid
  const isValidPosition = (row: number, col: number): boolean => {
    return !occupiedPositions.has(`${row},${col}`);
  };

  // Get first position
  let row1, col1;
  do {
    row1 = Math.floor(Math.random() * size);
    col1 = Math.floor(Math.random() * size);
  } while (!isValidPosition(row1, col1));

  positions.push({ row: row1, col: col1 });
  occupiedPositions.add(`${row1},${col1}`);

  // Get second position, ensuring some minimal distance
  let row2, col2;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    row2 = Math.floor(Math.random() * size);
    col2 = Math.floor(Math.random() * size);
    attempts++;
    
    // Simple manhattan distance to ensure some challenge
    const distance = Math.abs(row2 - row1) + Math.abs(col2 - col1);
    
    // Try to place endpoints with some distance between them
    if (distance >= 2 && isValidPosition(row2, col2)) {
      break;
    }
  } while (attempts < maxAttempts);

  positions.push({ row: row2, col: col2 });
  return positions;
};

/**
 * Add a connection between two cells
 */
export const addConnection = (
  board: FlowBoard,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  color: FlowColor
): FlowBoard => {
  const newBoard = deepClone(board);
  
  // If the target cell is empty, create a new point
  if (!newBoard[toRow][toCol]) {
    newBoard[toRow][toCol] = {
      row: toRow,
      col: toCol,
      color,
      isEndpoint: false,
      connections: [],
    };
  }

  // Add connection to the source cell
  if (newBoard[fromRow][fromCol]) {
    newBoard[fromRow][fromCol].connections.push({
      fromRow,
      fromCol,
      toRow,
      toCol,
      color,
    });
  }

  // Add connection to the target cell
  if (newBoard[toRow][toCol]) {
    newBoard[toRow][toCol].connections.push({
      fromRow: toRow,
      fromCol: toCol,
      toRow: fromRow,
      toCol: fromCol,
      color,
    });
  }

  return newBoard;
};

/**
 * Clear all connections of a specific color
 */
export const clearConnections = (board: FlowBoard, color: FlowColor): FlowBoard => {
  const newBoard = deepClone(board);
  const size = newBoard.length;

  // Remove connections of this color
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = newBoard[row][col];
      
      if (cell) {
        if (cell.color === color && !cell.isEndpoint) {
          // Remove non-endpoint cells of this color
          newBoard[row][col] = null;
        } else if (cell.color === color) {
          // Clear connections from endpoints
          cell.connections = cell.connections.filter(
            (conn) => conn.color !== color
          );
        }
      }
    }
  }

  return newBoard;
};

/**
 * Check if the level is complete (all cells filled, all endpoints connected)
 */
export const isLevelComplete = (board: FlowBoard): boolean => {
  const size = board.length;
  const endpointsByColor = new Map<FlowColor, FlowPoint[]>();
  let emptyCellCount = 0;

  // Find all endpoints and count empty cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      
      if (!cell) {
        emptyCellCount++;
      } else if (cell.isEndpoint) {
        if (!endpointsByColor.has(cell.color)) {
          endpointsByColor.set(cell.color, []);
        }
        endpointsByColor.get(cell.color)?.push(cell);
      }
    }
  }

  // If there are empty cells, the board is not complete
  if (emptyCellCount > 0) {
    return false;
  }

  // Check if all endpoints are connected
  for (const [color, endpoints] of endpointsByColor.entries()) {
    if (endpoints.length !== 2) {
      return false; // Should always have exactly 2 endpoints per color
    }
    
    // Check if the two endpoints have connections
    const [endpoint1, endpoint2] = endpoints;
    
    if (endpoint1.connections.length === 0 || endpoint2.connections.length === 0) {
      return false;
    }
  }

  return true;
};
