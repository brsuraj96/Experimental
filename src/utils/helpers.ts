import { Difficulty } from '../types';

/**
 * Get the next difficulty level
 */
export const getNextDifficulty = (current: Difficulty): Difficulty => {
  switch (current) {
    case Difficulty.EASY:
      return Difficulty.MEDIUM;
    case Difficulty.MEDIUM:
      return Difficulty.HARD;
    case Difficulty.HARD:
      return Difficulty.EASY;
    default:
      return Difficulty.EASY;
  }
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Deep clone an object or array
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }
  
  const clonedObj = {} as T;
  Object.keys(obj).forEach(key => {
    (clonedObj as any)[key] = deepClone((obj as any)[key]);
  });
  
  return clonedObj;
}

/**
 * Format time from seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Create a 2D array with dimensions rows x cols filled with initialValue
 */
export function create2DArray<T>(rows: number, cols: number, initialValue: T): T[][] {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(initialValue));
}

/**
 * Check if two 2D arrays are equal
 */
export function areArraysEqual<T>(arr1: T[][], arr2: T[][]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].length !== arr2[i].length) return false;
    
    for (let j = 0; j < arr1[i].length; j++) {
      if (arr1[i][j] !== arr2[i][j]) return false;
    }
  }
  
  return true;
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
