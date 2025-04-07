import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameType, Difficulty, GameProgress } from '../types';
import { getNextDifficulty } from '../utils/helpers';
import { api } from '../api/bridge';

interface GameContextProps {
  progress: GameProgress;
  updateProgress: (gameType: GameType, difficulty: Difficulty) => Promise<void>;
  getNextLevel: (gameType: GameType, difficulty: Difficulty) => Difficulty;
}

const GameContext = createContext<GameContextProps>({
  progress: {
    [GameType.SUDOKU]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
    [GameType.SLIDE_TILES]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
    [GameType.FLOW_FREE]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
  },
  updateProgress: async () => {},
  getNextLevel: () => Difficulty.EASY,
});

export const useGameContext = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<GameProgress>({
    [GameType.SUDOKU]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
    [GameType.SLIDE_TILES]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
    [GameType.FLOW_FREE]: {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    },
  });

  // Load progress from storage or API on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await api.getGameProgress();
        setProgress(savedProgress);
      } catch (error) {
        console.error('Error loading game progress:', error);
      }
    };

    loadProgress();
  }, []);

  // Update progress for a specific game and difficulty
  const updateProgress = async (gameType: GameType, difficulty: Difficulty) => {
    try {
      // Increment level
      const currentLevel = progress[gameType][difficulty];
      const newLevel = currentLevel + 1;
      
      // Get the current user (in a real app, you'd get this from auth context)
      const user = await api.getUser();
      const userId = user?.id || 1; // Default to user ID 1 if no user found
      
      // Update via API
      await api.updateGameProgress(userId, gameType, difficulty, newLevel);
      
      // Update state
      setProgress((prev) => ({
        ...prev,
        [gameType]: {
          ...prev[gameType],
          [difficulty]: newLevel,
        },
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Get the next level of difficulty
  const getNextLevel = (gameType: GameType, difficulty: Difficulty): Difficulty => {
    // If current difficulty is HARD, cycle back to EASY
    // Otherwise, move to the next difficulty level
    return getNextDifficulty(difficulty);
  };

  return (
    <GameContext.Provider
      value={{
        progress,
        updateProgress,
        getNextLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
