import { Platform } from 'react-native';
import { GameType, Difficulty, GameProgress } from '../types';

// WebSocket for real-time updates
class WebSocketConnection {
  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isConnected = false;

  constructor(private url: string) {}

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.notifyHandlers('connect', { connected: true });
        // Clear any reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          
          // Notify all handlers for this message type
          if (data.type) {
            this.notifyHandlers(data.type, data.data || data);
          }
          
          // Also notify generic message handlers
          this.notifyHandlers('message', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.notifyHandlers('disconnect', { connected: false });
        
        // Try to reconnect after 5 seconds
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 5000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyHandlers('error', { error });
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private notifyHandlers(event: string, data: any) {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket handler for event ${event}:`, error);
      }
    });
  }
}

// Create WebSocket connection
let wsConnection: WebSocketConnection | null = null;

if (Platform.OS === 'web') {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  wsConnection = new WebSocketConnection(wsUrl);
  wsConnection.connect();
}

// Export WebSocket connection for use in other parts of the app
export const webSocket = wsConnection;

// Define the API interface for our bridge
export interface ApiInterface {
  // User related
  getUser: () => Promise<any>;
  
  // Game progress related
  getGameProgress: (userId?: number) => Promise<GameProgress>;
  updateGameProgress: (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) => Promise<any>;
  
  // Game sessions related
  addGameSession: (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    moves: number,
    timeTaken: number,
    completed: boolean
  ) => Promise<any>;
  
  // Database status
  getDatabaseStatus: () => Promise<any>;
}

// Web specific API implementation
const webApi: ApiInterface = {
  getUser: async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  getGameProgress: async (userId = 1) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game progress');
      }
      
      const data = await response.json();
      
      // Transform the data to match our expected format
      const progressData: GameProgress = {
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
      
      // Map the returned data into our format
      data.forEach((item: any) => {
        if (progressData[item.game_type] && progressData[item.game_type][item.difficulty]) {
          progressData[item.game_type][item.difficulty] = item.level;
        }
      });
      
      return progressData;
    } catch (error) {
      console.error('API Error:', error);
      return {
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
    }
  },
  
  updateGameProgress: async (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) => {
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameType,
          difficulty,
          level,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game progress');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  addGameSession: async (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    moves: number,
    timeTaken: number,
    completed: boolean
  ) => {
    try {
      const response = await fetch('/api/session/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameType,
          difficulty,
          moves,
          timeTaken,
          completed,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add game session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  getDatabaseStatus: async () => {
    try {
      const response = await fetch('/api/db/status');
      if (!response.ok) {
        throw new Error('Failed to get database status');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { status: 'disconnected', error: String(error) };
    }
  },
};

// Local storage based implementation (for mobile)
import { getGameProgress as getLocalGameProgress, saveGameProgress, updateLevelProgress } from '../utils/storage';

const mobileApi: ApiInterface = {
  getUser: async () => {
    // Mock user for mobile
    return { id: 1, username: 'Guest', created_at: new Date().toISOString() };
  },
  
  getGameProgress: async () => {
    return await getLocalGameProgress();
  },
  
  updateGameProgress: async (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    level: number
  ) => {
    await updateLevelProgress(gameType, difficulty, level);
    return { success: true };
  },
  
  addGameSession: async (
    userId: number,
    gameType: GameType,
    difficulty: Difficulty,
    moves: number,
    timeTaken: number,
    completed: boolean
  ) => {
    // In mobile we don't persistently store sessions yet, just return success
    return { 
      id: Date.now(),
      user_id: userId,
      game_type: gameType,
      difficulty,
      moves,
      time_taken: timeTaken,
      completed,
      created_at: new Date().toISOString()
    };
  },
  
  getDatabaseStatus: async () => {
    // Mobile doesn't have a database connection
    return { 
      status: 'local', 
      message: 'Using local storage on mobile' 
    };
  },
};

// Export the appropriate API based on platform
export const api: ApiInterface = Platform.OS === 'web' ? webApi : mobileApi;

// Sync function that can be used to sync data from local storage to the server
// This would be useful when a user logs in on mobile and wants to sync progress
export const syncLocalToServer = async (userId: number): Promise<boolean> => {
  if (Platform.OS === 'web') {
    // No need to sync on web
    return true;
  }
  
  try {
    // Get local progress
    const progress = await getLocalGameProgress();
    
    // For each game type and difficulty, update server
    for (const gameType of Object.values(GameType)) {
      for (const difficulty of Object.values(Difficulty)) {
        const level = progress[gameType]?.[difficulty] || 0;
        if (level > 0) {
          // Only sync non-zero levels
          await webApi.updateGameProgress(userId, gameType, difficulty, level);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
};