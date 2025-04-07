// Import the GameType and Difficulty enums directly
const GameType = {
  SUDOKU: 'Sudoku',
  SLIDE_TILES: 'Slide Tiles',
  FLOW_FREE: 'Flow Free',
  CROSSWORD: 'Crossword',
  JIGSAW: 'Jigsaw',
  MATCHSTICK: 'Matchstick',
  SPOT_DIFFERENCE: 'Spot the Difference',
  WATER_FLOW: 'Water Flow',
  TRIVIA: 'Trivia',
  RIDDLES: 'Riddles'
};

const Difficulty = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard'
};

// Import the database connection pool
const { pool } = require('./db');

// Memory storage implementation for development/testing
class MemStorage {
  constructor() {
    this.users = [];
    this.gameProgress = [];
    this.gameSessions = [];
    this.userId = 1;
    this.progressId = 1;
    this.sessionId = 1;
  }

  async getUser(id) {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  async createUser(user) {
    const newUser = {
      id: this.userId++,
      ...user,
      created_at: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async getGameProgress(userId, gameType) {
    return this.gameProgress.filter(p => p.user_id === userId && p.game_type === gameType);
  }

  async updateGameProgress(userId, gameType, difficulty, level) {
    const existingProgress = this.gameProgress.find(
      p => p.user_id === userId && p.game_type === gameType && p.difficulty === difficulty
    );

    if (existingProgress) {
      existingProgress.level = Math.max(existingProgress.level, level);
      existingProgress.completed += 1;
      existingProgress.last_played = new Date();
      return existingProgress;
    } else {
      const newProgress = {
        id: this.progressId++,
        user_id: userId,
        game_type: gameType,
        difficulty,
        level,
        completed: 1,
        last_played: new Date()
      };
      this.gameProgress.push(newProgress);
      return newProgress;
    }
  }

  async createGameSession(session) {
    const newSession = {
      id: this.sessionId++,
      ...session,
      created_at: new Date()
    };
    this.gameSessions.push(newSession);
    return newSession;
  }

  async getGameSessions(userId, gameType, limit = 10) {
    return this.gameSessions
      .filter(s => s.user_id === userId && s.game_type === gameType)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}

// Database storage implementation using raw SQL queries
export class DatabaseStorage {
  async getUser(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
        [user.username, user.email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getGameProgress(userId, gameType) {
    try {
      const result = await pool.query(
        'SELECT * FROM game_progress WHERE user_id = $1 AND game_type = $2',
        [userId, gameType]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting game progress:', error);
      return [];
    }
  }

  async updateGameProgress(userId, gameType, difficulty, level) {
    try {
      // First check if the progress exists
      const existingResult = await pool.query(
        'SELECT * FROM game_progress WHERE user_id = $1 AND game_type = $2 AND difficulty = $3',
        [userId, gameType, difficulty]
      );
      
      let result;
      if (existingResult.rows.length > 0) {
        // Update the existing record
        const existingProgress = existingResult.rows[0];
        result = await pool.query(
          `UPDATE game_progress 
          SET level = GREATEST(level, $1), 
              completed = completed + 1,
              last_played = NOW()
          WHERE id = $2
          RETURNING *`,
          [level, existingProgress.id]
        );
      } else {
        // Create a new record
        result = await pool.query(
          `INSERT INTO game_progress 
          (user_id, game_type, difficulty, level, completed)
          VALUES ($1, $2, $3, $4, 1)
          RETURNING *`,
          [userId, gameType, difficulty, level]
        );
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating game progress:', error);
      throw error;
    }
  }

  async createGameSession(session) {
    try {
      const result = await pool.query(
        `INSERT INTO game_sessions 
        (user_id, game_type, difficulty, moves, time_taken, completed)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          session.user_id, 
          session.game_type, 
          session.difficulty, 
          session.moves || 0, 
          session.time_taken || 0, 
          session.completed || false
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
  }

  async getGameSessions(userId, gameType, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT * FROM game_sessions 
        WHERE user_id = $1 AND game_type = $2
        ORDER BY created_at DESC
        LIMIT $3`,
        [userId, gameType, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting game sessions:', error);
      return [];
    }
  }
}

// Export the storage instance
// For now, use MemStorage as a fallback if database connection fails
let storage;

try {
  // Try to use database storage
  storage = new DatabaseStorage();
  console.log('Using database storage');
} catch (error) {
  // Fallback to memory storage
  console.warn('Failed to initialize database storage, falling back to memory storage', error);
  storage = new MemStorage();
}

module.exports = {
  storage,
  DatabaseStorage,
  MemStorage,
  GameType,
  Difficulty
};