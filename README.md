# 👑 King of Diamonds - Multiplayer Strategy Game 💎

A web-based multiplayer game inspired by "King of Diamonds" from Alice in Borderland, combining psychological strategy with mathematical precision and number-based logic. 🎮✨

## 🎮 Game Overview

Compete to be the last survivor by strategically selecting numbers each round. The game features dynamic rules that activate as players are eliminated, creating an evolving challenge that requires adaptability, cunning, and mathematical thinking. Face off against intelligent AI opponents named after playing cards in this battle of wits.

## 🏗️ Project Structure

```
King of Diamonds/
├── backend/          # Node.js + Express + Socket.io server
├── frontend/         # React + TypeScript + Tailwind CSS client
├── docs/             # All documentation files
│   ├── GAME_RULES.md         # Detailed game rules and mechanics
│   ├── DEVELOPMENT.md        # Development guide and testing
│   ├── DEPLOYMENT.md         # Production deployment guide
│   ├── IMPLEMENTATION_SUMMARY.md # Implementation overview
│   ├── MATCHMAKING.md        # Matchmaking system documentation
│   ├── TIMEOUT_ELIMINATION_FEATURE.md # Timeout feature documentation
│   ├── ZERO_HUNDRED_BUG_FIX.md # Zero-hundred rule fix documentation
│   ├── backend/              # Backend-specific documentation
│   │   ├── README.md         # Backend API documentation
│   │   ├── ARCHITECTURE.md   # Backend architecture guide
│   │   └── AI_SYSTEM_README.md # AI system documentation
│   └── frontend/             # Frontend-specific documentation
│       └── README.md         # Frontend component documentation
└── README.md         # This file
```

## 🚀 Quick Start

### 📋 Prerequisites

- 📦 Node.js (v18+ recommended) **OR** Bun.js (v1.0+ recommended)
- 📦 npm, yarn, or bun package manager

### 💾 Installation & Setup

1. **📥 Clone the Repository**

   ```bash
   git clone https://github.com/kshanxs/King-of-Diamonds.git
   cd "King of Diamonds"
   ```

2. **🔧 Install Backend Dependencies**

   With npm:
   ```bash
   cd backend
   npm install
   ```

   With Bun (faster):
   ```bash
   cd backend
   bun install
   ```

3. **🔧 Install Frontend Dependencies**

   With npm:
   ```bash
   cd frontend
   npm install
   ```

   With Bun (faster):
   ```bash
   cd frontend
   bun install
   ```

4. **🚀 Start the Backend Server**

   With Node.js:
   ```bash
   cd backend
   node server.js
   ```

   With Bun (faster startup):
   ```bash
   cd backend
   bun run server.js
   ```

   The server will start on `http://localhost:5001` 🌐

5. **🎨 Start the Frontend Development Server**

   With npm:
   ```bash
   cd frontend
   npm run dev
   ```

   With Bun (faster):
   ```bash
   cd frontend
   bun run dev
   ```

   The client will start on `http://localhost:5173` 🌐

6. **🌐 Open your browser** and navigate to `http://localhost:5173`

## 🎯 Current Game Features

### 🎮 Game Modes

- **Solo Mode**: Play against 4 intelligent AI opponents with unique playing card personalities
- **Multiplayer Mode**: Create rooms and play with friends (up to 5 players)
- **Auto-fill**: Rooms automatically fill with AI bots to maintain 5-player games

### 🧠 AI Opponents

Face off against strategically named AI opponents with advanced intelligence:

- **Kings**: King of Hearts, King of Spades, King of Diamonds, King of Clubs
- **Queens**: Queen of Diamonds, Queen of Hearts, Queen of Clubs, Queen of Spades  
- **Jacks**: Jack of Hearts, Jack of Diamonds, Jack of Spades, Jack of Clubs
- **Aces**: Ace of Hearts, Ace of Diamonds, Ace of Spades, Ace of Clubs

Each bot has unique personalities and strategic behaviors:

- **Kings**: Aggressive risk-takers (Risk: 0.8, Calculation: 0.6)
- **Queens**: Balanced calculators with strong mathematical focus (Risk: 0.5, Calculation: 0.8)
- **Jacks**: Unpredictable wildcards (Risk: 0.7, Calculation: 0.4)
- **Aces**: Mathematical precision experts (Risk: 0.3, Calculation: 0.9)

### ⚡ Real-time Features

- **Live Synchronization**: Real-time updates across all players using Socket.io
- **Smart Round Progression**: 10-second countdown with early start when all players ready
- **Player Status Tracking**: See who's ready, who's choosing
- **Copy Room Codes**: Easy room sharing with one-click copy

### 🧪 Development & Testing

- **Component Testing**: Test individual components during development
- **Mock Data Support**: Pre-configured test scenarios for development
- **Browser DevTools**: Built-in debugging and testing capabilities

### 🌐 LAN Multiplayer

- **Network Discovery**: Automatic detection of game servers on local network
- **QR Code Connection**: Generate QR codes for easy mobile device connection
- **Cross-Platform**: Play on different devices connected to same WiFi
- **Health Monitoring**: Real-time server status and connection quality

### 🎨 Modern UI/UX

- **Glassmorphism Design**: Beautiful, modern card-table aesthetic
- **Playing Card Theme**: Card-inspired background and visual elements
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Animations**: Smooth transitions and visual feedback
- **Live Leaderboard**: Dynamic sorting and real-time updates

## 🎲 Core Game Mechanics

### Basic Rules

1. **Choose a number** (0-100) within 60 seconds each round
2. **Target calculation**: Average of all choices × 0.8
3. **Winner**: Player closest to the target
4. **Scoring**: Winner unchanged, others lose 1 point
5. **Elimination**: Reach -10 points and you're out
6. **Victory**: Last player standing wins

### Progressive Rule System

The game evolves as players are eliminated:

- **Always Active**: Timeout penalty (-2 points for no submission, elimination after 2nd consecutive timeout)
- **After 1 elimination**: Duplicate number penalty (-1 point)
- **After 2 eliminations**: Exact target bonus/penalty (-2 points to others)
- **After 3 eliminations**: Zero-hundred gambit (0 vs 100 special rule)

### Current Player Management

- **Active Players**: Players currently participating in the game
- **Game Continuation**: Game continues smoothly with remaining players

*For detailed rules and strategies, see [docs/GAME_RULES.md](docs/GAME_RULES.md)*

## 🛠️ Technology Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **Vite** for fast development and building

### Backend

- **Node.js** with Express.js (or **Bun.js** for faster performance)
- **Socket.io** for WebSocket communication
- **CORS** enabled for cross-origin requests
- **UUID** for unique player and room identification

### Development Tools

- **TypeScript** for type safety
- **ESLint** for code quality
- **Hot reload** for rapid development
- **Bun.js** support for faster package management and runtime

## 📁 File Structure

```text
King of Diamonds/
├── backend/
│   ├── models/
│   │   └── GameRoom.js          # Core game logic and room management
│   ├── services/
│   │   └── BotAI.js             # AI bot intelligence system
│   ├── handlers/
│   │   └── socketHandlers.js    # Socket.io event handlers
│   ├── config/
│   │   └── constants.js         # Game constants and configuration
│   ├── server.js                # Main server file
│   ├── package.json             # Backend dependencies
│   └── README.md                # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── GameRoom.tsx     # Main game interface
│   │   │   ├── LiveLeaderboard.tsx # Real-time leaderboard
│   │   │   ├── RoundResultModal.tsx # Round results display
│   │   │   └── HomePage.tsx     # Landing page
│   │   ├── hooks/
│   │   │   └── useGameRoom.ts   # Game state management hook
│   │   ├── services/
│   │   │   ├── apiService.ts    # REST API calls
│   │   │   └── socketService.ts # Socket.io client service
│   │   ├── types/
│   │   │   └── game.ts          # TypeScript type definitions
│   │   ├── index.css            # Global styles with playing card theme
│   │   └── main.tsx             # Entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   └── README.md                # Frontend documentation
├── docs/                        # Documentation directory
│   ├── README.md               # Documentation index and overview
│   ├── GAME_RULES.md           # Detailed game rules and strategy guide
│   ├── DEVELOPMENT.md          # Development guide and testing
│   ├── DEPLOYMENT.md           # Production deployment guide
│   ├── LAN_SETUP.md            # LAN multiplayer setup and configuration
│   ├── IMPLEMENTATION_SUMMARY.md # Implementation overview
│   ├── MATCHMAKING.md          # Matchmaking system documentation
│   ├── TIMEOUT_ELIMINATION_FEATURE.md # Timeout feature documentation
│   ├── ZERO_HUNDRED_BUG_FIX.md # Zero-hundred rule fix documentation
│   ├── backend/                # Backend-specific docs
│   │   ├── README.md           # Backend API documentation
│   │   ├── ARCHITECTURE.md     # Backend architecture guide
│   │   └── AI_SYSTEM_README.md # AI system documentation
│   └── frontend/               # Frontend-specific docs
│       └── README.md           # Frontend component documentation
└── README.md                   # This file
```

## 🚀 Development

### Running in Development Mode

**With Node.js:**

1. Start the backend server:

   ```bash
   cd backend
   node server.js
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

**With Bun (recommended for faster performance):**

1. Start the backend server:

   ```bash
   cd backend
   bun run server.js
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   bun run dev
   ```

### Building for Production

**With npm:**

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

**With Bun (faster build):**

1. Build the frontend:

   ```bash
   cd frontend
   bun run build
   ```

2. The backend can be deployed as-is with Node.js or Bun

### Environment Configuration

- **Backend Port**: Default 5001 (configurable via PORT environment variable)
- **Frontend Dev Port**: Default 5173 (Vite default)
- **CORS Origin**: Currently set to `http://localhost:5173`

### 🏠 LAN Multiplayer Setup

For detailed instructions on setting up LAN multiplayer with automatic network discovery:

**Quick LAN Setup:**

```bash
# Run the automated LAN setup script
./start-lan.sh
```

**Manual Setup:**

1. Start backend with network binding: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Connect devices on same network using displayed IP addresses
4. Use QR codes for easy mobile connection

📖 **Detailed Guide**: See [docs/LAN_SETUP.md](docs/LAN_SETUP.md) for comprehensive LAN setup instructions, troubleshooting, and network configuration.

## 🎮 How to Play

### Quick Start Guide

1. **Enter your name** on the homepage
2. **Choose game mode**:
   - Click "Create Room" for solo play with AI opponents
   - Or enter a room code to join friends
3. **Wait for players** or start immediately with AI
4. **Make strategic choices** each round (0-100)
5. **Survive elimination** and be the last player standing

### Strategy Tips

- **Early Game**: Play conservatively, choose numbers around 40-50
- **Mid Game**: Adapt to active rules, avoid duplicates
- **End Game**: Master the zero-hundred gambit for victory
- **Always Submit**: Timeout penalty is harsh (-2 points)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Inspiration

Inspired by the psychological strategy games from "Alice in Borderland," specifically the King of Diamonds game that combines mathematical precision with psychological warfare.

---

**Ready to test your strategic mind? Enter the world of King of Diamonds and prove you have what it takes to survive!** 👑💎
