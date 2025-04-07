import { WaterFlowBoard, WaterFlowLevel, PipeType, PipeCell, Difficulty } from '../../../types';
import { deepClone, getRandomInt } from '../../../utils/helpers';

/**
 * Generate a new water flow level based on difficulty
 */
export const generateLevel = (difficulty: Difficulty): WaterFlowLevel => {
  let size: number;
  let emptyPercentage: number;
  
  // Set board size and number of empty cells based on difficulty
  switch (difficulty) {
    case Difficulty.EASY:
      size = 5;
      emptyPercentage = 0.1; // 10% empty cells
      break;
    case Difficulty.MEDIUM:
      size = 6;
      emptyPercentage = 0.15; // 15% empty cells
      break;
    case Difficulty.HARD:
      size = 7;
      emptyPercentage = 0.2; // 20% empty cells
      break;
    default:
      size = 5;
      emptyPercentage = 0.1;
  }

  // Generate an initial solved board
  const { board, sourcePosition, destinationPosition } = generateSolvedBoard(size);
  
  // Randomize rotations to make the puzzle challenging
  const puzzleBoard = randomizeRotations(board, emptyPercentage);
  
  return {
    size,
    board: puzzleBoard,
    sourcePosition,
    destinationPosition
  };
};

/**
 * Generate a board with a valid solution path
 */
const generateSolvedBoard = (size: number): { 
  board: WaterFlowBoard, 
  sourcePosition: { row: number, col: number }, 
  destinationPosition: { row: number, col: number } 
} => {
  // Create an empty board
  const board: WaterFlowBoard = Array(size).fill(null).map((_, row) => 
    Array(size).fill(null).map((_, col) => ({
      type: PipeType.EMPTY,
      rotation: 0,
      isFixed: false,
      isConnected: false,
      row,
      col
    }))
  );
  
  // Place source in a random position on the left edge
  const sourceRow = getRandomInt(1, size - 2);
  const sourcePosition = { row: sourceRow, col: 0 };
  board[sourceRow][0] = {
    type: PipeType.SOURCE,
    rotation: 0, // Pointing right
    isFixed: true,
    isConnected: true,
    row: sourceRow,
    col: 0
  };
  
  // Place destination in a random position on the right edge
  const destRow = getRandomInt(1, size - 2);
  const destinationPosition = { row: destRow, col: size - 1 };
  board[destRow][size - 1] = {
    type: PipeType.DESTINATION,
    rotation: 180, // Pointing left
    isFixed: true,
    isConnected: true,
    row: destRow,
    col: size - 1
  };
  
  // Generate a random path from source to destination
  const path = generateRandomPath(size, sourcePosition, destinationPosition);
  
  // Place pipes along the path
  for (const position of path) {
    if ((position.row === sourcePosition.row && position.col === sourcePosition.col) ||
        (position.row === destinationPosition.row && position.col === destinationPosition.col)) {
      continue; // Skip source and destination
    }
    
    const { row, col, type, rotation } = position;
    board[row][col] = {
      type,
      rotation,
      isFixed: false,
      isConnected: true,
      row,
      col
    };
  }
  
  // Fill remaining empty cells with random pipes
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].type === PipeType.EMPTY) {
        const randomPipeType = getRandomPipeType();
        const randomRotation = getRandomRotation();
        
        board[row][col] = {
          type: randomPipeType,
          rotation: randomRotation,
          isFixed: false,
          isConnected: false,
          row,
          col
        };
      }
    }
  }
  
  return { board, sourcePosition, destinationPosition };
};

/**
 * Generate a random path from source to destination
 */
const generateRandomPath = (
  size: number,
  sourcePosition: { row: number, col: number },
  destPosition: { row: number, col: number }
): Array<{ row: number, col: number, type: PipeType, rotation: 0 | 90 | 180 | 270 }> => {
  const path: Array<{ row: number, col: number, type: PipeType, rotation: 0 | 90 | 180 | 270 }> = [];
  
  // Start with the source
  path.push({
    row: sourcePosition.row,
    col: sourcePosition.col,
    type: PipeType.SOURCE,
    rotation: 0
  });
  
  // Current position starts one step right from the source
  let currentRow = sourcePosition.row;
  let currentCol = sourcePosition.col + 1;
  
  // Direction vectors (right, down, left, up)
  const directions = [
    { dRow: 0, dCol: 1 },  // right
    { dRow: 1, dCol: 0 },  // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: -1, dCol: 0 }  // up
  ];
  
  // Track visited cells
  const visited = new Set<string>();
  visited.add(`${sourcePosition.row},${sourcePosition.col}`);
  visited.add(`${currentRow},${currentCol}`);
  
  // Add the first pipe after source
  let lastDirection = 0; // Initially moving right from source
  
  // Continue until we're next to the destination
  while (!(currentRow === destPosition.row && currentCol === destPosition.col - 1)) {
    // Track the current pipe before moving
    const previousRow = currentRow;
    const previousCol = currentCol;
    const previousDirection = lastDirection;
    
    // Possible new directions (prefer continuing in same direction)
    const possibleDirections = [0, 1, 2, 3].filter(d => {
      const newRow = currentRow + directions[d].dRow;
      const newCol = currentCol + directions[d].dCol;
      
      // Check if the new position is valid and not visited
      return newRow >= 0 && newRow < size && 
             newCol >= 0 && newCol < size && 
             !visited.has(`${newRow},${newCol}`) &&
             !(newRow === sourcePosition.row && newCol === sourcePosition.col);
    });
    
    // If we can't go anywhere, backtrack (should not happen with proper implementation)
    if (possibleDirections.length === 0) {
      // This is a simplification - a real game would need more complex backtracking
      break;
    }
    
    // Choose a random direction with preference to continue straight
    const straightIdx = possibleDirections.findIndex(d => d === lastDirection);
    const directionIdx = straightIdx !== -1 && Math.random() < 0.7 ? 
      straightIdx : Math.floor(Math.random() * possibleDirections.length);
    
    lastDirection = possibleDirections[directionIdx];
    
    // Move in the chosen direction
    currentRow += directions[lastDirection].dRow;
    currentCol += directions[lastDirection].dCol;
    
    // Mark as visited
    visited.add(`${currentRow},${currentCol}`);
    
    // Determine pipe type and rotation based on previous and current directions
    const { type, rotation } = determinePipeAndRotation(previousDirection, lastDirection);
    
    // Add the pipe to the path
    path.push({
      row: previousRow,
      col: previousCol,
      type,
      rotation
    });
  }
  
  // Add the last pipe before destination
  const { type, rotation } = determinePipeAndRotation(lastDirection, 2); // 2 = going left into destination
  path.push({
    row: currentRow,
    col: currentCol,
    type,
    rotation
  });
  
  // Add the destination
  path.push({
    row: destPosition.row,
    col: destPosition.col,
    type: PipeType.DESTINATION,
    rotation: 180
  });
  
  return path;
};

/**
 * Determine pipe type and rotation based on incoming and outgoing directions
 * Direction: 0 = right, 1 = down, 2 = left, 3 = up
 */
const determinePipeAndRotation = (
  inDirection: number, 
  outDirection: number
): { type: PipeType, rotation: 0 | 90 | 180 | 270 } => {
  // Normalize directions
  const normalizedIn = inDirection % 4;
  const normalizedOut = outDirection % 4;
  
  // Determine pipe type based on the directions
  if ((normalizedIn + 2) % 4 === normalizedOut) {
    // Straight pipe (opposite directions)
    const isHorizontal = normalizedIn % 2 === 0;
    return {
      type: PipeType.STRAIGHT,
      rotation: isHorizontal ? 0 : 90
    };
  } else if ((normalizedIn + 1) % 4 === normalizedOut || (normalizedIn + 3) % 4 === normalizedOut) {
    // Corner pipe (perpendicular directions)
    if (normalizedIn === 0 && normalizedOut === 1) {
      return { type: PipeType.CORNER, rotation: 0 };
    } else if (normalizedIn === 1 && normalizedOut === 2) {
      return { type: PipeType.CORNER, rotation: 90 };
    } else if (normalizedIn === 2 && normalizedOut === 3) {
      return { type: PipeType.CORNER, rotation: 180 };
    } else if (normalizedIn === 3 && normalizedOut === 0) {
      return { type: PipeType.CORNER, rotation: 270 };
    } else if (normalizedIn === 0 && normalizedOut === 3) {
      return { type: PipeType.CORNER, rotation: 270 };
    } else if (normalizedIn === 3 && normalizedOut === 2) {
      return { type: PipeType.CORNER, rotation: 180 };
    } else if (normalizedIn === 2 && normalizedOut === 1) {
      return { type: PipeType.CORNER, rotation: 90 };
    } else {
      return { type: PipeType.CORNER, rotation: 0 };
    }
  } else {
    // This shouldn't happen with valid paths
    return { type: PipeType.STRAIGHT, rotation: 0 };
  }
};

/**
 * Randomize rotations of pipes on the board
 */
const randomizeRotations = (board: WaterFlowBoard, emptyPercentage: number): WaterFlowBoard => {
  const newBoard = deepClone(board);
  const size = newBoard.length;
  
  // Randomize rotations for non-fixed pipes
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = newBoard[row][col];
      
      if (!cell.isFixed) {
        if (Math.random() < emptyPercentage) {
          // Make some cells empty
          cell.type = PipeType.EMPTY;
        } else {
          // Randomize rotation of other pipes
          cell.rotation = getRandomRotation();
        }
        cell.isConnected = false;
      }
    }
  }
  
  return newBoard;
};

/**
 * Get a random pipe type
 */
const getRandomPipeType = (): PipeType => {
  const types = [PipeType.STRAIGHT, PipeType.CORNER, PipeType.T_SHAPE, PipeType.CROSS];
  const weights = [0.4, 0.4, 0.15, 0.05]; // Weighted probabilities
  
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < types.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return types[i];
    }
  }
  
  return PipeType.STRAIGHT;
};

/**
 * Get a random rotation (0, 90, 180, or 270 degrees)
 */
const getRandomRotation = (): 0 | 90 | 180 | 270 => {
  const rotations: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270];
  return rotations[Math.floor(Math.random() * rotations.length)];
};

/**
 * Rotate a pipe 90 degrees clockwise
 */
export const rotatePipe = (board: WaterFlowBoard, row: number, col: number): WaterFlowBoard => {
  const newBoard = deepClone(board);
  
  // Don't rotate fixed pipes (source and destination)
  if (newBoard[row][col].isFixed) {
    return newBoard;
  }
  
  // Update the rotation
  newBoard[row][col].rotation = ((newBoard[row][col].rotation + 90) % 360) as 0 | 90 | 180 | 270;
  
  return newBoard;
};

/**
 * Check if the pipe can connect in a given direction
 * Direction: 0 = right, 1 = down, 2 = left, 3 = up
 */
const canConnectInDirection = (pipe: PipeCell, direction: number): boolean => {
  const { type, rotation } = pipe;
  
  // Normalize direction based on pipe rotation
  const normalizedDirection = (direction - rotation / 90 + 4) % 4;
  
  switch (type) {
    case PipeType.STRAIGHT:
      return normalizedDirection % 2 === 0; // Can connect horizontally (0 or 2)
    
    case PipeType.CORNER:
      return normalizedDirection === 0 || normalizedDirection === 3; // Can connect right and up
    
    case PipeType.T_SHAPE:
      return normalizedDirection !== 2; // Can connect in all directions except behind
    
    case PipeType.CROSS:
      return true; // Can connect in all directions
    
    case PipeType.SOURCE:
      return direction === 0; // Can connect to the right
    
    case PipeType.DESTINATION:
      return direction === 2; // Can connect from the left
    
    default:
      return false;
  }
};

/**
 * Check if water can flow from one pipe to another
 */
const canFlow = (
  fromPipe: PipeCell,
  toPipe: PipeCell,
  direction: number
): boolean => {
  // Check if fromPipe can connect in the given direction
  if (!canConnectInDirection(fromPipe, direction)) {
    return false;
  }
  
  // Check if toPipe can connect in the opposite direction
  const oppositeDirection = (direction + 2) % 4;
  return canConnectInDirection(toPipe, oppositeDirection);
};

/**
 * Check if the level is complete (water flows from source to destination)
 */
export const isLevelComplete = (board: WaterFlowBoard, sourcePosition: { row: number, col: number }): boolean => {
  const size = board.length;
  const visited = new Set<string>();
  
  // Direction vectors (right, down, left, up)
  const directions = [
    { dRow: 0, dCol: 1 },  // right
    { dRow: 1, dCol: 0 },  // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: -1, dCol: 0 }  // up
  ];
  
  // Start DFS from the source
  const stack: Array<{ row: number, col: number }> = [sourcePosition];
  visited.add(`${sourcePosition.row},${sourcePosition.col}`);
  
  while (stack.length > 0) {
    const { row, col } = stack.pop()!;
    const currentPipe = board[row][col];
    
    // Check if we've reached the destination
    if (currentPipe.type === PipeType.DESTINATION) {
      return true;
    }
    
    // Check all four directions
    for (let d = 0; d < directions.length; d++) {
      const newRow = row + directions[d].dRow;
      const newCol = col + directions[d].dCol;
      
      // Check if the new position is valid
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && 
          !visited.has(`${newRow},${newCol}`)) {
        
        const nextPipe = board[newRow][newCol];
        
        // Check if water can flow in this direction
        if (canFlow(currentPipe, nextPipe, d)) {
          visited.add(`${newRow},${newCol}`);
          stack.push({ row: newRow, col: newCol });
        }
      }
    }
  }
  
  // If we've explored all connected pipes and didn't reach the destination
  return false;
};

/**
 * Get connected pipes (for highlighting the solution)
 */
export const getConnectedPipes = (
  board: WaterFlowBoard, 
  sourcePosition: { row: number, col: number }
): WaterFlowBoard => {
  const newBoard = deepClone(board);
  const size = newBoard.length;
  const visited = new Set<string>();
  
  // Direction vectors (right, down, left, up)
  const directions = [
    { dRow: 0, dCol: 1 },  // right
    { dRow: 1, dCol: 0 },  // down
    { dRow: 0, dCol: -1 }, // left
    { dRow: -1, dCol: 0 }  // up
  ];
  
  // Reset all pipes to not connected
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      newBoard[row][col].isConnected = false;
    }
  }
  
  // Start DFS from the source
  const stack: Array<{ row: number, col: number }> = [sourcePosition];
  visited.add(`${sourcePosition.row},${sourcePosition.col}`);
  newBoard[sourcePosition.row][sourcePosition.col].isConnected = true;
  
  while (stack.length > 0) {
    const { row, col } = stack.pop()!;
    const currentPipe = newBoard[row][col];
    
    // Check all four directions
    for (let d = 0; d < directions.length; d++) {
      const newRow = row + directions[d].dRow;
      const newCol = col + directions[d].dCol;
      
      // Check if the new position is valid
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && 
          !visited.has(`${newRow},${newCol}`)) {
        
        const nextPipe = newBoard[newRow][newCol];
        
        // Check if water can flow in this direction
        if (canFlow(currentPipe, nextPipe, d)) {
          visited.add(`${newRow},${newCol}`);
          nextPipe.isConnected = true;
          stack.push({ row: newRow, col: newCol });
        }
      }
    }
  }
  
  return newBoard;
};

/**
 * Get a hint (the next pipe to rotate)
 */
export const getHint = (
  board: WaterFlowBoard, 
  sourcePosition: { row: number, col: number },
  destinationPosition: { row: number, col: number }
): { row: number, col: number } | null => {
  const size = board.length;
  
  // Try rotating each pipe and check if it completes the level
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      
      // Skip fixed pipes and empty cells
      if (cell.isFixed || cell.type === PipeType.EMPTY) {
        continue;
      }
      
      // Try each possible rotation
      const originalRotation = cell.rotation;
      const possibleRotations: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270];
      
      for (const newRotation of possibleRotations) {
        if (newRotation === originalRotation) {
          continue;
        }
        
        // Create a test board with this rotation
        const testBoard = deepClone(board);
        testBoard[row][col].rotation = newRotation;
        
        // Check if this rotation fixes the puzzle
        if (isLevelComplete(testBoard, sourcePosition)) {
          return { row, col };
        }
      }
    }
  }
  
  // If no single rotation fixes the puzzle, look for the first pipe that's not connected
  const connectedBoard = getConnectedPipes(board, sourcePosition);
  
  // Find the first non-fixed, non-connected pipe
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = connectedBoard[row][col];
      
      if (!cell.isFixed && !cell.isConnected && cell.type !== PipeType.EMPTY) {
        return { row, col };
      }
    }
  }
  
  return null;
};