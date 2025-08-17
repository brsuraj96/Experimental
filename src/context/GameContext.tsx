import React, { createContext, useContext, useState, useEffect } from "react";
import { GameType, Difficulty, GameProgress } from "../types";
import { getNextDifficulty } from "../utils/helpers";
import { api } from "../api/bridge";
import { apiService } from "../services/apiService";
import {
  syncGameProgressToCloud,
  getGameProgress as getLocalGameProgress,
} from "../utils/storage";
import { Platform } from "react-native";

interface GameContextProps {
  progress: GameProgress;
  updateProgress: (
    gameType: GameType,
    difficulty: Difficulty,
    sessionData?: any
  ) => Promise<void>;
  getNextLevel: (gameType: GameType, difficulty: Difficulty) => Difficulty;
  syncProgress: () => Promise<boolean>;
  isOnline: boolean;
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
  syncProgress: async () => false,
  isOnline: false,
});

export const useGameContext = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const [isOnline, setIsOnline] = useState(false);

  // Load progress from storage or API on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try to load from API first (if online)
        const apiResponse = await apiService.getGameProgress();

        if (apiResponse.success && apiResponse.data) {
          // Transform API data to local format
          const apiProgress: GameProgress = {
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
          };

          apiResponse.data.forEach((item) => {
            if (
              apiProgress[item.game_type] &&
              apiProgress[item.game_type][item.difficulty] !== undefined
            ) {
              apiProgress[item.game_type][item.difficulty] = item.current_level;
            }
          });

          setProgress(apiProgress);
          setIsOnline(true);
        } else {
          // Fallback to local storage
          const localProgress = await getLocalGameProgress();
          setProgress(localProgress);
          setIsOnline(false);
        }
      } catch (error) {
        console.error("Error loading game progress:", error);
        // Fallback to local storage
        try {
          const localProgress = await getLocalGameProgress();
          setProgress(localProgress);
        } catch (localError) {
          console.error("Error loading local progress:", localError);
        }
        setIsOnline(false);
      }
    };

    loadProgress();
  }, []);

  // Update progress for a specific game and difficulty
  const updateProgress = async (
    gameType: GameType,
    difficulty: Difficulty,
    sessionData?: any
  ) => {
    try {
      // Increment level
      const currentLevel = progress[gameType][difficulty];
      const newLevel = currentLevel + 1;

      // Prepare session data with defaults
      const defaultSessionData = {
        level: newLevel,
        score: 0,
        time: 0,
        moves: 0,
        hints: 0,
        mistakes: 0,
        completed: true,
        ...sessionData,
      };

      // Update local state immediately (optimistic update)
      setProgress((prev) => ({
        ...prev,
        [gameType]: {
          ...prev[gameType],
          [difficulty]: newLevel,
        },
      }));

      // Try to sync with API
      if (isOnline) {
        try {
          const success = await syncGameProgressToCloud(
            gameType,
            difficulty,
            defaultSessionData
          );
          if (success) {
            console.log("Progress synced to cloud successfully");
          } else {
            console.warn("Failed to sync progress to cloud, will retry later");
          }
        } catch (error) {
          console.error("Error syncing to cloud:", error);
          setIsOnline(false);
        }
      }

      // Always update local storage as backup
      await api.updateGameProgress(1, gameType, difficulty, newLevel);
    } catch (error) {
      console.error("Error updating progress:", error);
      // Revert optimistic update on error
      setProgress((prev) => ({
        ...prev,
        [gameType]: {
          ...prev[gameType],
          [difficulty]: currentLevel,
        },
      }));
    }
  };

  // Get the next level of difficulty
  const getNextLevel = (
    gameType: GameType,
    difficulty: Difficulty
  ): Difficulty => {
    // If current difficulty is HARD, cycle back to EASY
    // Otherwise, move to the next difficulty level
    return getNextDifficulty(difficulty);
  };

  // Sync local progress to cloud
  const syncProgress = async (): Promise<boolean> => {
    try {
      const response = await apiService.getGameProgress();
      if (response.success && response.data) {
        // Update local state with cloud data
        const cloudProgress: GameProgress = {
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
        };

        response.data.forEach((item) => {
          if (
            cloudProgress[item.game_type] &&
            cloudProgress[item.game_type][item.difficulty] !== undefined
          ) {
            cloudProgress[item.game_type][item.difficulty] = item.current_level;
          }
        });

        setProgress(cloudProgress);
        setIsOnline(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error syncing progress:", error);
      setIsOnline(false);
      return false;
    }
  };

  return (
    <GameContext.Provider
      value={{
        progress,
        updateProgress,
        getNextLevel,
        syncProgress,
        isOnline,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
