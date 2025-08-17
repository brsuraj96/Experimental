// src/services/apiService.ts
import { apiRequest, gameApi } from "../utils/apiGateway";
import { GameType, Difficulty } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  membership_type: "free" | "premium";
  is_verified: boolean;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_type: GameType;
  difficulty: Difficulty;
  level: number;
  moves: number;
  time_taken: number;
  score: number;
  hints_used: number;
  mistakes: number;
  completed: boolean;
  is_perfect: boolean;
  session_data?: Record<string, any>;
  created_at: string;
}

export interface GameProgressData {
  game_type: GameType;
  difficulty: Difficulty;
  current_level: number;
  levels_completed: number;
  best_time?: number;
  best_score: number;
  total_games_played: number;
  total_games_won: number;
  perfect_games: number;
  current_streak: number;
  best_streak: number;
  hints_used: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url?: string;
  score: number;
  time?: number;
  game_type: GameType;
  difficulty: Difficulty;
}

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  game_type: GameType;
  difficulty: Difficulty;
  content_data: Record<string, any>;
  bonus_multiplier: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  condition_type: string;
  condition_value: number;
  game_type?: GameType;
  difficulty?: Difficulty;
  reward_type: string;
  reward_value: number;
  earned_at?: string;
}

class ApiService {
  // Authentication
  async register(email: string, password: string, username: string) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    });
  }

  async login(email: string, password: string) {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.access_token) {
      await AsyncStorage.setItem("access_token", response.data.access_token);
      if (response.data.instance_id) {
        await AsyncStorage.setItem("instance_id", response.data.instance_id);
      }
    }

    return response;
  }

  async logout() {
    const response = await apiRequest("/auth/logout", { method: "POST" });
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("instance_id");
    return response;
  }

  async refreshToken() {
    return apiRequest("/auth/refresh", { method: "POST" });
  }

  // User Management
  async getCurrentUser(): Promise<{
    success: boolean;
    data?: User;
    error?: string;
  }> {
    return apiRequest("/users/me");
  }

  async updateProfile(updates: Partial<User>) {
    return apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async uploadAvatar(imageData: string) {
    return apiRequest("/users/me/avatar", {
      method: "POST",
      body: JSON.stringify({ image: imageData }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async enable2FA() {
    return apiRequest("/users/me/2fa", { method: "POST" });
  }

  async disable2FA(code: string) {
    return apiRequest("/users/me/2fa", {
      method: "DELETE",
      body: JSON.stringify({ code }),
    });
  }

  async upgradeMembership() {
    return apiRequest("/users/me/membership", {
      method: "PUT",
      body: JSON.stringify({ membership_type: "premium" }),
    });
  }

  // Game Progress
  async getGameProgress(): Promise<{
    success: boolean;
    data?: GameProgressData[];
    error?: string;
  }> {
    return gameApi.getGameProgress();
  }

  async updateGameProgress(
    gameType: GameType,
    difficulty: Difficulty,
    level: number,
    sessionData: {
      score: number;
      time: number;
      moves: number;
      hints: number;
      mistakes: number;
      completed: boolean;
    }
  ) {
    return gameApi.updateGameProgress(gameType, difficulty, level, sessionData);
  }

  // Game Sessions
  async createGameSession(
    sessionData: Omit<GameSession, "id" | "user_id" | "created_at">
  ) {
    return apiRequest("/games/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  }

  async getGameSessions(
    gameType?: GameType,
    page: number = 0,
    limit: number = 20
  ) {
    return gameApi.getGameHistory(gameType, page, limit);
  }

  // Save States
  async saveGameState(
    gameType: GameType,
    difficulty: Difficulty,
    level: number,
    saveData: Record<string, any>,
    moves: number,
    timeElapsed: number
  ) {
    return apiRequest("/games/saves", {
      method: "POST",
      body: JSON.stringify({
        game_type: gameType,
        difficulty,
        level,
        save_data: saveData,
        moves,
        time_elapsed: timeElapsed,
      }),
    });
  }

  async loadGameState(
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) {
    return apiRequest(
      `/games/saves?game_type=${gameType}&difficulty=${difficulty}&level=${level}`
    );
  }

  async deleteGameState(
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) {
    return apiRequest(
      `/games/saves?game_type=${gameType}&difficulty=${difficulty}&level=${level}`,
      {
        method: "DELETE",
      }
    );
  }

  // Leaderboards
  async getLeaderboards(
    gameType?: GameType,
    difficulty?: Difficulty,
    limit: number = 100
  ): Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }> {
    const params = new URLSearchParams();
    if (gameType) params.append("game_type", gameType);
    if (difficulty) params.append("difficulty", difficulty);
    params.append("limit", limit.toString());

    return apiRequest(`/games/leaderboards?${params.toString()}`);
  }

  // Daily Challenges
  async getDailyChallenge(
    date?: string
  ): Promise<{ success: boolean; data?: DailyChallenge; error?: string }> {
    return gameApi.getDailyChallenge(date);
  }

  async submitDailyChallenge(
    challengeId: string,
    sessionData: Record<string, any>
  ) {
    return gameApi.submitDailyChallenge(challengeId, sessionData);
  }

  async getDailyChallengeAttempts() {
    return apiRequest("/games/daily-challenges/attempts");
  }

  // Achievements
  async getAchievements(): Promise<{
    success: boolean;
    data?: Achievement[];
    error?: string;
  }> {
    return apiRequest("/users/me/achievements");
  }

  async getAvailableAchievements(): Promise<{
    success: boolean;
    data?: Achievement[];
    error?: string;
  }> {
    return apiRequest("/achievements");
  }

  // Statistics
  async getUserStats() {
    return apiRequest("/users/me/stats");
  }

  async getGameStats(gameType: GameType, difficulty?: Difficulty) {
    const params = new URLSearchParams();
    params.append("game_type", gameType);
    if (difficulty) params.append("difficulty", difficulty);

    return apiRequest(`/users/me/stats/games?${params.toString()}`);
  }

  // Game Content
  async getGameContent(
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) {
    return apiRequest(
      `/games/content?game_type=${gameType}&difficulty=${difficulty}&level=${level}`
    );
  }

  // Real-time features
  async subscribeToUpdates(callback: (data: any) => void) {
    // This would typically use WebSocket or Server-Sent Events
    // Implementation depends on your real-time solution
    console.log("Subscribing to real-time updates...");
  }

  // Offline sync
  async syncOfflineData(offlineData: any[]) {
    return apiRequest("/sync/offline", {
      method: "POST",
      body: JSON.stringify({ data: offlineData }),
    });
  }

  // Health check
  async healthCheck() {
    return apiRequest("/health");
  }
}

export const apiService = new ApiService();
export default apiService;
