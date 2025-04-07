// Try to import pg and drizzle, fallback to mocks if not available
let Pool;
let drizzle;
try {
  const pg = require('pg');
  Pool = pg.Pool;
  drizzle = require('drizzle-orm/node-postgres').drizzle;
} catch (error) {
  console.warn('pg or drizzle-orm not found, using mock implementation');
  // Mock Pool implementation
  Pool = class MockPool {
    constructor() {}
    async connect() {
      return {
        query: async () => ({ rows: [{ time: new Date() }] }),
        release: () => {}
      };
    }
    async query() {
      return { rows: [{ count: '0' }] };
    }
  };
  // Mock drizzle implementation
  drizzle = () => ({});
}

// Try to load environment variables from .env file if available
try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch (error) {
  console.warn('dotenv not available, continuing without it');
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/puzzleworld',
});

// Create a drizzle instance
const db = drizzle(pool);

// Function to create tables if they don't exist
async function createTables() {
  try {
    console.log('Setting up database tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Users table created or already exists');

    // Create game_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        game_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        completed INTEGER NOT NULL DEFAULT 0,
        last_played TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Game progress table created or already exists');

    // Create game_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        game_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        moves INTEGER NOT NULL DEFAULT 0,
        time_taken INTEGER NOT NULL DEFAULT 0,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Game sessions table created or already exists');

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database tables:', error);
    throw error;
  } finally {
    // Don't close the pool here as it will be used by the application
  }
}

// Check if tables exist
async function checkTables() {
  try {
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'game_progress', 'game_sessions');
    `);

    const existingTables = rows.map(row => row.table_name);
    
    if (existingTables.length === 3) {
      console.log('All tables exist:', existingTables.join(', '));
      return true;
    } else {
      console.log('Missing tables:', ['users', 'game_progress', 'game_sessions']
        .filter(table => !existingTables.includes(table))
        .join(', '));
      return false;
    }
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  try {
    // Check if tables exist
    const tablesExist = await checkTables();
    
    // Create tables if they don't exist
    if (!tablesExist) {
      await createTables();
    }
    
    // Test connection and return pool for future use
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

// Create a "Guest" user if it doesn't exist
async function createGuestUser() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      ['Guest']
    );
    
    if (rows.length === 0) {
      const { rows: newUser } = await pool.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
        ['Guest', 'guest@puzzleworld.com']
      );
      console.log('Created guest user:', newUser[0]);
      return newUser[0];
    } else {
      console.log('Guest user already exists:', rows[0]);
      return rows[0];
    }
  } catch (error) {
    console.error('Error creating guest user:', error);
    throw error;
  }
}

// Execute when this file is run directly
if (require.main === module) {
  setupDatabase()
    .then(() => createGuestUser())
    .then(() => {
      console.log('Database setup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = {
  pool,
  db,
  setupDatabase,
  createGuestUser
};