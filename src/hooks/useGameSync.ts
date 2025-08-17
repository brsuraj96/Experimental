import { useState, useEffect, useCallback } from "react";
import { apiGatewayRequest } from "../utils/apiGateway";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameType, Difficulty } from "../types";

interface UseGameSyncProps {
  gameId: string;
  gameType: GameType;
  difficulty: Difficulty;
}

interface GameState {
  board: any;
  moves: number;
  mistakes: number;
  score: number;
  time: number;
  isCompleted: boolean;
  metadata?: any;
}

interface SessionStats {
  moves: number;
  mistakes: number;
  score: number;
  time: number;
  success: boolean;
  completedAt?: string;
}

export const useGameSync = ({
  gameId,
  gameType,
  difficulty,
}: UseGameSyncProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load game state from backend
  const loadGameState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGatewayRequest(`/api/games/${gameId}/state`);
      if (response.ok) {
        const data = await response.json();
        return data.state || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to load game state:", error);
      setError("Failed to load saved game");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Save game state to backend with fallback to local
  const saveGameState = useCallback(
    async (state: GameState) => {
      setIsSyncing(true);
      setError(null);

      try {
        const response = await apiGatewayRequest(`/api/games/${gameId}/state`, {
          method: "POST",
          body: JSON.stringify({
            gameType,
            difficulty,
            state,
            lastSaved: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          return true;
        } else {
          // Fallback to local storage
          await AsyncStorage.setItem(`game_${gameId}`, JSON.stringify(state));
          return true;
        }
      } catch (error) {
        console.error("Failed to save game state:", error);
        // Fallback to local storage
        await AsyncStorage.setItem(`game_${gameId}`, JSON.stringify(state));
        return true;
      } finally {
        setIsSyncing(false);
      }
    },
    [gameId, gameType, difficulty]
  );

  // Post session stats to backend
  const postSessionStats = useCallback(
    async (stats: SessionStats) => {
      setIsSyncing(true);
      setError(null);

      try {
        const response = await apiGatewayRequest("/api/games/stats", {
          method: "POST",
          body: JSON.stringify({
            gameId,
            gameType,
            difficulty,
            ...stats,
            timestamp: new Date().toISOString(),
          }),
        });

        return response.ok;
      } catch (error) {
        console.error("Failed to post session stats:", error);
        setError("Failed to save session data");
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [gameId, gameType, difficulty]
  );

  // Load from local storage as fallback
  const loadLocalState = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(`game_${gameId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load local state:", error);
      return null;
    }
  }, [gameId]);

  return {
    isLoading,
    isSyncing,
    error,
    loadGameState,
    saveGameState,
    postSessionStats,
    loadLocalState,
  };
};
