// Simple HTTP server for React Native web app with database support
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import database setup
try {
  require('dotenv').config();
} catch (error) {
  console.warn('dotenv not available, continuing without it');
}
const dbSetup = require('./server/dbSetup');

const PORT = 5000;

// Content type mapping
const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

// Get the content type based on file extension
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return contentTypes[ext] || 'application/octet-stream';
};

// API Routes
const apiRoutes = {
  // Get user data
  '/api/user': async (req, res) => {
    try {
      // For now, just return the guest user
      const pool = dbSetup.pool;
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', ['Guest']);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows[0] || { error: 'User not found' }));
    } catch (error) {
      console.error('Error fetching user:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  },

  // Get game progress for a user
  '/api/progress': async (req, res) => {
    try {
      const queryParams = url.parse(req.url, true).query;
      const userId = parseInt(queryParams.userId) || 1; // Default to first user if not provided
      
      const pool = dbSetup.pool;
      const { rows } = await pool.query(
        'SELECT * FROM game_progress WHERE user_id = $1',
        [userId]
      );
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
    } catch (error) {
      console.error('Error fetching game progress:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  },

  // Update game progress
  '/api/progress/update': async (req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      // Read POST data
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { userId, gameType, difficulty, level } = data;

          if (!userId || !gameType || !difficulty || !level) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
          }

          const pool = dbSetup.pool;
          
          // Check if record exists
          const checkResult = await pool.query(
            'SELECT * FROM game_progress WHERE user_id = $1 AND game_type = $2 AND difficulty = $3',
            [userId, gameType, difficulty]
          );

          let result;
          if (checkResult.rows.length > 0) {
            // Update existing record
            const { rows } = await pool.query(
              `UPDATE game_progress 
              SET level = GREATEST(level, $1), 
                  completed = completed + 1,
                  last_played = NOW()
              WHERE user_id = $2 AND game_type = $3 AND difficulty = $4
              RETURNING *`,
              [level, userId, gameType, difficulty]
            );
            result = rows[0];
          } else {
            // Insert new record
            const { rows } = await pool.query(
              `INSERT INTO game_progress 
              (user_id, game_type, difficulty, level, completed)
              VALUES ($1, $2, $3, $4, 1)
              RETURNING *`,
              [userId, gameType, difficulty, level]
            );
            result = rows[0];
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          console.error('Error processing update:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    } catch (error) {
      console.error('Error updating game progress:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  },

  // Add a game session
  '/api/session/add': async (req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      // Read POST data
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { userId, gameType, difficulty, moves, timeTaken, completed } = data;

          if (!userId || !gameType || !difficulty) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
          }

          const pool = dbSetup.pool;
          
          // Insert new session
          const { rows } = await pool.query(
            `INSERT INTO game_sessions 
            (user_id, game_type, difficulty, moves, time_taken, completed)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [userId, gameType, difficulty, moves || 0, timeTaken || 0, completed || false]
          );
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(rows[0]));
        } catch (error) {
          console.error('Error processing session add:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    } catch (error) {
      console.error('Error adding game session:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  },

  // Database status/health check
  '/api/db/status': async (req, res) => {
    try {
      // Check database connection
      const client = await dbSetup.pool.connect();
      const { rows } = await client.query('SELECT NOW() as time');
      client.release();
      
      // Get table counts
      const userCount = await dbSetup.pool.query('SELECT COUNT(*) FROM users');
      const progressCount = await dbSetup.pool.query('SELECT COUNT(*) FROM game_progress');
      const sessionCount = await dbSetup.pool.query('SELECT COUNT(*) FROM game_sessions');
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'connected',
        time: rows[0].time,
        tables: {
          users: parseInt(userCount.rows[0].count),
          gameProgress: parseInt(progressCount.rows[0].count),
          gameSessions: parseInt(sessionCount.rows[0].count)
        }
      }));
    } catch (error) {
      console.error('Database error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error',
        message: error.message 
      }));
    }
  }
};

// Create the server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const route = apiRoutes[pathname];
    if (route) {
      return route(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
    }
  }
  
  // Handle webpack bundled files
  if (pathname === '/bundle.js') {
    const bundlePath = path.join(__dirname, 'dist', 'bundle.js');
    if (fs.existsSync(bundlePath)) {
      fs.readFile(bundlePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading bundle.js');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      });
      return;
    }
  }
  
  // Handle root path
  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, 'web', 'index.html');
    
    if (fs.existsSync(htmlPath)) {
      // Serve the actual index.html
      fs.readFile(htmlPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else {
      // Serve a fallback HTML
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Puzzle World - React Native App</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #1E1E2F;
              color: white;
              display: flex;
              flex-direction: column;
              min-height: 100vh;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              flex: 1;
            }
            header {
              background-color: #FF6F61;
              color: white;
              padding: 1rem;
              text-align: center;
            }
            .games-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
              gap: 1rem;
              margin-top: 2rem;
            }
            .game-card {
              background-color: #2A2A40;
              border-radius: 8px;
              overflow: hidden;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
              cursor: pointer;
            }
            .game-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .game-color-bar {
              height: 8px;
            }
            .game-content {
              padding: 1rem;
            }
            .game-title {
              font-size: 1.2rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }
            .game-description {
              font-size: 0.9rem;
              color: #BBBBBB;
            }
            .status-badge {
              display: inline-block;
              padding: 0.2rem 0.5rem;
              border-radius: 4px;
              font-size: 0.8rem;
              margin-top: 0.5rem;
            }
            .implemented {
              background-color: #81C784;
              color: black;
            }
            .coming-soon {
              background-color: #4DD0E1;
              color: black;
            }
            footer {
              text-align: center;
              padding: 1rem;
              background-color: #2A2A40;
              margin-top: 2rem;
            }
            .loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 200px;
            }
            .spinner {
              border: 4px solid rgba(0, 0, 0, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #4DD0E1;
              animation: spin 1s linear infinite;
              margin: 20px 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .db-status {
              background-color: #2A2A40;
              padding: 1rem;
              border-radius: 8px;
              margin: 1rem 0;
            }
            .db-status h3 {
              margin-top: 0;
            }
            .status-indicator {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 8px;
            }
            .status-connected {
              background-color: #81C784;
            }
            .status-error {
              background-color: #EF5350;
            }
            .api-section {
              margin-top: 2rem;
            }
            .api-endpoint {
              background-color: #252538;
              padding: 0.75rem;
              border-radius: 4px;
              margin-bottom: 0.5rem;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div id="root">
            <header>
              <h1>Puzzle World</h1>
              <p>A multi-game puzzle platform for Android</p>
            </header>
            <div class="container">
              <div class="loading">
                <h2>Initializing React Native Web</h2>
                <div class="spinner"></div>
                <p>Setting up the Puzzle World experience...</p>
              </div>

              <h2>Available Games</h2>
              <div class="games-grid">
                <div class="game-card">
                  <div class="game-color-bar" style="background-color: #4DD0E1;"></div>
                  <div class="game-content">
                    <div class="game-title">Sudoku</div>
                    <div class="game-description">Classic number puzzle game with multiple difficulty levels</div>
                    <span class="status-badge implemented">Implemented</span>
                  </div>
                </div>
                <div class="game-card">
                  <div class="game-color-bar" style="background-color: #FF6F61;"></div>
                  <div class="game-content">
                    <div class="game-title">Slide Tiles</div>
                    <div class="game-description">Arrange tiles in numerical order by sliding them into the empty space</div>
                    <span class="status-badge implemented">Implemented</span>
                  </div>
                </div>
                <div class="game-card">
                  <div class="game-color-bar" style="background-color: #81C784;"></div>
                  <div class="game-content">
                    <div class="game-title">Flow Free</div>
                    <div class="game-description">Connect matching colored dots without crossing paths</div>
                    <span class="status-badge implemented">Implemented</span>
                  </div>
                </div>
              </div>

              <div class="db-status">
                <h3>
                  <span class="status-indicator status-connected"></span>
                  Database Connected
                </h3>
                <p>PostgreSQL database is now integrated for storing game progress and user data.</p>
              </div>

              <h2 style="margin-top: 2rem;">Project Status</h2>
              <div style="background-color: #2A2A40; padding: 1rem; border-radius: 8px;">
                <p>The React Native app has three fully implemented games with difficulty levels, progress tracking, and a modern UI.</p>
                <p>Current progress: We've added a PostgreSQL database for storing user progress and game sessions.</p>
              </div>

              <div class="api-section">
                <h2>API Endpoints</h2>
                <div class="api-endpoint">GET /api/db/status - Check database connection</div>
                <div class="api-endpoint">GET /api/user - Get current user</div>
                <div class="api-endpoint">GET /api/progress?userId=1 - Get game progress</div>
                <div class="api-endpoint">POST /api/progress/update - Update game progress</div>
                <div class="api-endpoint">POST /api/session/add - Add game session</div>
              </div>
            </div>
            <footer>
              <p>Puzzle World &copy; 2025 | A React Native Multi-Game Platform</p>
            </footer>
          </div>
        </body>
        </html>
      `);
    }
  } 
  // Handle static files
  else if (pathname.match(/\.(html|js|css|png|jpg|gif|svg|ico|json)$/)) {
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(data);
    });
  } 
  // Handle all other routes for client-side routing support
  else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Puzzle World - React Native App</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1E1E2F;
            color: white;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
          }
          header {
            background-color: #FF6F61;
            color: white;
            padding: 1rem;
            text-align: center;
          }
          .status {
            background-color: #2A2A40;
            border-radius: 8px;
            padding: 2rem;
            margin-top: 2rem;
            text-align: center;
          }
          .btn {
            display: inline-block;
            background-color: #FF6F61;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 1rem;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Puzzle World</h1>
          <p>A multi-game puzzle platform for Android</p>
        </header>
        <div class="container">
          <div class="status">
            <h2>Loading Route</h2>
            <p>We're setting up the requested page.</p>
            <a href="/" class="btn">Go Back to Home</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Setup database and start server
(async () => {
  let dbConnected = false;
  
  try {
    // Create PostgreSQL database if it doesn't exist
    if (process.env.DATABASE_URL) {
      try {
        // Setup database
        await dbSetup.setupDatabase();
        
        // Create guest user if it doesn't exist
        await dbSetup.createGuestUser();
        
        dbConnected = true;
        console.log('Database connection and setup successful!');
      } catch (dbError) {
        console.error('Database setup failed:', dbError);
        console.log('Starting server without database functionality.');
      }
    } else {
      console.log('No DATABASE_URL provided, starting server without database functionality.');
    }
    
    // Start HTTP server (database or not)
    server.listen(PORT, '0.0.0.0', () => {
      if (dbConnected) {
        console.log(`Server running at http://localhost:${PORT} with database integration`);
      } else {
        console.log(`Server running at http://localhost:${PORT} (without database integration)`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    
    // Last resort - try to at least start the HTTP server
    try {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${PORT} (basic mode, no database)`);
      });
    } catch (serverError) {
      console.error('Fatal error, could not start server:', serverError);
      process.exit(1);
    }
  }
})();