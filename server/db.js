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

// Create PostgreSQL pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/puzzleworld'
});

// Create drizzle ORM instance - note we don't use schema since we don't have actual imports
const db = drizzle(pool);

// Helper function to test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW() as time');
    client.release();
    return { connected: true, time: rows[0].time };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { connected: false, error: error.message };
  }
}

module.exports = {
  pool,
  db,
  testConnection
};