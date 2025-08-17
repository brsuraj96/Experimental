// src/utils/apiGateway.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  (Platform.OS === "web"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://api.yourapp.com");

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGatewayRequest(
  path: string,
  options: any = {}
): Promise<Response> {
  const token = await AsyncStorage.getItem("access_token");
  const instanceId = await AsyncStorage.getItem("instance_id");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(instanceId && { "x-instance-id": instanceId }),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, config);

    // Handle instance moved
    if (response.status === 409) {
      const data = await response.json();
      if (data.instance_id) {
        await AsyncStorage.setItem("instance_id", data.instance_id);
        // Retry request with new instance ID
        const retryHeaders = {
          ...headers,
          "x-instance-id": data.instance_id,
        };
        return fetch(`${API_BASE_URL}${path}`, {
          ...config,
          headers: retryHeaders,
        });
      }
    }

    // Handle authentication errors
    if (response.status === 401) {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("instance_id");
      throw new ApiError("Authentication required", 401, response);
    }

    return response;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error.message}`, 0, error);
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: any = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await apiGatewayRequest(path, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
        data: data,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error(`API request failed for ${path}:`, error);
    return {
      success: false,
      error: error instanceof ApiError ? error.message : "Network error",
    };
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  const res = await apiGatewayRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (data.instance_id) {
    await AsyncStorage.setItem("instance_id", data.instance_id);
  }
  if (data.access_token) {
    await AsyncStorage.setItem("access_token", data.access_token);
  }
  return data;
}

export async function loginUser(email: string, password: string) {
  const res = await apiGatewayRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.instance_id) {
    await AsyncStorage.setItem("instance_id", data.instance_id);
  }
  if (data.access_token) {
    await AsyncStorage.setItem("access_token", data.access_token);
  }
  return data;
}

// Enhanced Game API with proper typing and error handling
export const gameApi = {
  async getGameState(gameId: string) {
    return apiRequest(`/api/games/${gameId}/state`);
  },

  async saveGameState(gameId: string, payload: any) {
    return apiRequest(`/api/games/${gameId}/state`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async postSessionStats(payload: any) {
    return apiRequest("/api/games/stats", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getGameHistory(
    gameType?: string,
    page: number = 0,
    limit: number = 20
  ) {
    const params = new URLSearchParams();
    if (gameType) params.append("gameType", gameType);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    return apiRequest(`/api/games/history?${params.toString()}`);
  },

  async getLeaderboard(
    gameType: string,
    difficulty: string,
    limit: number = 100
  ) {
    return apiRequest(
      `/api/games/leaderboard?gameType=${gameType}&difficulty=${difficulty}&limit=${limit}`
    );
  },

  async updateGameProgress(
    gameType: string,
    difficulty: string,
    level: number,
    sessionData: any
  ) {
    return apiRequest("/api/games/progress", {
      method: "POST",
      body: JSON.stringify({
        gameType,
        difficulty,
        level,
        ...sessionData,
      }),
    });
  },

  async getGameProgress() {
    return apiRequest("/api/games/progress");
  },

  async getDailyChallenge(date?: string) {
    const params = date ? `?date=${date}` : "";
    return apiRequest(`/api/games/daily-challenge${params}`);
  },

  async submitDailyChallenge(challengeId: string, sessionData: any) {
    return apiRequest(`/api/games/daily-challenge/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  },
};
