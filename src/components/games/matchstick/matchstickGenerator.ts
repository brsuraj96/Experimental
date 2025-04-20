import { Difficulty, MatchstickLevel, Matchstick } from '../../../types';

/**
 * Generate a matchstick puzzle level based on difficulty
 */
export const generateMatchstickLevel = (difficulty: Difficulty): MatchstickLevel => {
  switch (difficulty) {
    case Difficulty.EASY:
      return generateEasyLevel();
    case Difficulty.MEDIUM:
      return generateMediumLevel();
    case Difficulty.HARD:
      return generateHardLevel();
    default:
      return generateEasyLevel();
  }
};

/**
 * Generate an easy matchstick puzzle (equation with one move)
 */
const generateEasyLevel = (): MatchstickLevel => {
  // Initial equation: 1+2=3
  // Target equation: 7-4=3 (Move one matchstick to change 1 to 7)
  
  const matchsticks: Matchstick[] = [
    // Number 1
    {
      id: 1,
      x1: 50,
      y1: 80,
      x2: 50,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 2
    {
      id: 2,
      x1: 120,
      y1: 80,
      x2: 160,
      y2: 80,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 3,
      x1: 160,
      y1: 80,
      x2: 160,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 4,
      x1: 120,
      y1: 120,
      x2: 160,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 5,
      x1: 120,
      y1: 120,
      x2: 120,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 6,
      x1: 120,
      y1: 160,
      x2: 160,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Plus sign
    {
      id: 7,
      x1: 200,
      y1: 120,
      x2: 240,
      y2: 120,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 8,
      x1: 220,
      y1: 100,
      x2: 220,
      y2: 140,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 3
    {
      id: 9,
      x1: 280,
      y1: 80,
      x2: 320,
      y2: 80,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 10,
      x1: 320,
      y1: 80,
      x2: 320,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 11,
      x1: 280,
      y1: 120,
      x2: 320,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 12,
      x1: 320,
      y1: 120,
      x2: 320,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 13,
      x1: 280,
      y1: 160,
      x2: 320,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Equals sign
    {
      id: 14,
      x1: 240,
      y1: 110,
      x2: 280,
      y2: 110,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 15,
      x1: 240,
      y1: 130,
      x2: 280,
      y2: 130,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Extra matchstick to be moved
    {
      id: 16,
      x1: 30,
      y1: 220,
      x2: 70,
      y2: 220,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
  ];
  
  return {
    puzzle: {
      matchsticks,
      targetEquation: '7-4=3',
      currentEquation: '1+2=3',
      availableMatchsticks: 1
    },
    hint: 'Move the horizontal matchstick to the top-left to make the number 7, and move the horizontal plus sign to make it a minus sign.'
  };
};

/**
 * Generate a medium matchstick puzzle (equation with two moves)
 */
const generateMediumLevel = (): MatchstickLevel => {
  // Initial equation: 5+2=7
  // Target equation: 3+2=5 (Move two matchsticks to change 5 to 3 and 7 to 5)
  
  const matchsticks: Matchstick[] = [
    // Number 5
    {
      id: 1,
      x1: 40,
      y1: 80,
      x2: 80,
      y2: 80,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 2,
      x1: 40,
      y1: 80,
      x2: 40,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 3,
      x1: 40,
      y1: 120,
      x2: 80,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 4,
      x1: 80,
      y1: 120,
      x2: 80,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 5,
      x1: 40,
      y1: 160,
      x2: 80,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Plus sign
    {
      id: 6,
      x1: 120,
      y1: 120,
      x2: 160,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 7,
      x1: 140,
      y1: 100,
      x2: 140,
      y2: 140,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 2
    {
      id: 8,
      x1: 200,
      y1: 80,
      x2: 240,
      y2: 80,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 9,
      x1: 240,
      y1: 80,
      x2: 240,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 10,
      x1: 200,
      y1: 120,
      x2: 240,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 11,
      x1: 200,
      y1: 120,
      x2: 200,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 12,
      x1: 200,
      y1: 160,
      x2: 240,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Equals sign
    {
      id: 13,
      x1: 280,
      y1: 110,
      x2: 320,
      y2: 110,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 14,
      x1: 280,
      y1: 130,
      x2: 320,
      y2: 130,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 7
    {
      id: 15,
      x1: 360,
      y1: 80,
      x2: 400,
      y2: 80,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 16,
      x1: 400,
      y1: 80,
      x2: 400,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
  ];
  
  return {
    puzzle: {
      matchsticks,
      targetEquation: '3+2=5',
      currentEquation: '5+2=7',
      availableMatchsticks: 2
    },
    hint: 'Move one matchstick from the left 5 to make it a 3, and use one matchstick to complete the 7 into a 5.'
  };
};

/**
 * Generate a hard matchstick puzzle (equation with three moves)
 */
const generateHardLevel = (): MatchstickLevel => {
  // Initial equation: 6-4=2
  // Target equation: 8-3=5 (Move three matchsticks)
  
  const matchsticks: Matchstick[] = [
    // Number 6
    {
      id: 1,
      x1: 40,
      y1: 80,
      x2: 80,
      y2: 80,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 2,
      x1: 40,
      y1: 80,
      x2: 40,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 3,
      x1: 40,
      y1: 120,
      x2: 80,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 4,
      x1: 40,
      y1: 120,
      x2: 40,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 5,
      x1: 40,
      y1: 160,
      x2: 80,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 6,
      x1: 80,
      y1: 120,
      x2: 80,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Minus sign
    {
      id: 7,
      x1: 120,
      y1: 120,
      x2: 160,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 4
    {
      id: 8,
      x1: 200,
      y1: 80,
      x2: 200,
      y2: 120,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 9,
      x1: 240,
      y1: 80,
      x2: 240,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 10,
      x1: 200,
      y1: 120,
      x2: 240,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 11,
      x1: 240,
      y1: 120,
      x2: 240,
      y2: 160,
      isMovable: true,
      isSelected: false,
      isPlaced: false,
    },
    
    // Equals sign
    {
      id: 12,
      x1: 280,
      y1: 110,
      x2: 320,
      y2: 110,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 13,
      x1: 280,
      y1: 130,
      x2: 320,
      y2: 130,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    
    // Number 2
    {
      id: 14,
      x1: 360,
      y1: 80,
      x2: 400,
      y2: 80,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 15,
      x1: 400,
      y1: 80,
      x2: 400,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 16,
      x1: 360,
      y1: 120,
      x2: 400,
      y2: 120,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 17,
      x1: 360,
      y1: 120,
      x2: 360,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
    {
      id: 18,
      x1: 360,
      y1: 160,
      x2: 400,
      y2: 160,
      isMovable: false,
      isSelected: false,
      isPlaced: false,
    },
  ];
  
  return {
    puzzle: {
      matchsticks,
      targetEquation: '8-3=5',
      currentEquation: '6-4=2',
      availableMatchsticks: 3
    },
    hint: 'Move one matchstick from the top of the 4 to make a 3, move one from the right of the 4 to complete the 2 into a 5, and add one to the top of the 6 to make an 8.'
  };
};