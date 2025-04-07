// Simple HTTP server for React Native web app
const http = require('http');
const fs = require('fs');
const path = require('path');

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

// Create the server
const server = http.createServer((req, res) => {
  // Handle root path
  if (req.url === '/' || req.url === '/index.html') {
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

              <h2 style="margin-top: 2rem;">Project Status</h2>
              <div style="background-color: #2A2A40; padding: 1rem; border-radius: 8px;">
                <p>The React Native app has three fully implemented games with difficulty levels, progress tracking, and a modern UI.</p>
                <p>Current technical challenge: We're working on resolving dependency conflicts between Expo and React Native Web for browser rendering. The mobile app runs properly on Android devices.</p>
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
  else if (req.url.match(/\.(html|js|css|png|jpg|gif|svg|ico|json)$/)) {
    const filePath = path.join(__dirname, req.url);
    
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});