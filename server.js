// Simple server to display the app status
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
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
        </style>
      </head>
      <body>
        <header>
          <h1>Puzzle World</h1>
          <p>A multi-game puzzle platform for Android</p>
        </header>
        <div class="container">
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
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #FFEB3B;"></div>
              <div class="game-content">
                <div class="game-title">Crossword</div>
                <div class="game-description">Classic word puzzle where you fill words based on clues</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #9C27B0;"></div>
              <div class="game-content">
                <div class="game-title">Jigsaw</div>
                <div class="game-description">Piece together a scattered image</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #FF9800;"></div>
              <div class="game-content">
                <div class="game-title">Matchstick</div>
                <div class="game-description">Move matchsticks to solve mathematical equations</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #E91E63;"></div>
              <div class="game-content">
                <div class="game-title">Spot the Difference</div>
                <div class="game-description">Find differences between two similar images</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #00BCD4;"></div>
              <div class="game-content">
                <div class="game-title">Water Flow</div>
                <div class="game-description">Direct water from source to destination by rotating pipes</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #CDDC39;"></div>
              <div class="game-content">
                <div class="game-title">Trivia</div>
                <div class="game-description">Test your knowledge with multiple-choice questions</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
            <div class="game-card">
              <div class="game-color-bar" style="background-color: #009688;"></div>
              <div class="game-content">
                <div class="game-title">Riddles</div>
                <div class="game-description">Solve text-based brain teasers and riddles</div>
                <span class="status-badge coming-soon">Coming Soon</span>
              </div>
            </div>
          </div>

          <h2 style="margin-top: 2rem;">Project Status</h2>
          <div style="background-color: #2A2A40; padding: 1rem; border-radius: 8px;">
            <p><strong>Currently Implemented Games:</strong></p>
            <ul>
              <li>Sudoku: Complete with difficulty levels, notes mode, and hint system</li>
              <li>Slide Tiles: Working puzzle with shuffling and move validation</li>
              <li>Flow Free: Color path connection with level generation</li>
            </ul>
            <p><strong>Features:</strong></p>
            <ul>
              <li>Game progress tracking</li>
              <li>Timer for gameplay</li>
              <li>Move counting</li>
              <li>Dynamic level generation</li>
              <li>Responsive design for both portrait and landscape</li>
              <li>Completion celebrations with confetti</li>
            </ul>
            <p><strong>Technical Notes:</strong></p>
            <p>This application is built with React Native and can be run on Android devices. It features TypeScript for type safety, React Navigation for screen management, and custom game logic for each puzzle type.</p>
            <p>The application has some dependency conflicts in the web environment but functions properly on mobile devices.</p>
          </div>
        </div>
        <footer>
          <p>Puzzle World &copy; 2025 | A React Native Multi-Game Platform</p>
        </footer>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});