# 🎮 King of Diamonds - Backend 🚀

Node.js + Express + Socket.io backend server for the King of Diamonds multiplayer strategy game.

## 🛠️ Tech Stack

- **🟢 Node.js** - JavaScript runtime
- **🚂 Express.js** - Web application framework
- **🔌 Socket.io** - Real-time bidirectional communication
- **🆔 UUID** - Unique identifier generation
- **🌐 CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### 📋 Prerequisites

- 📦 Node.js (v18+ recommended)
- 📦 npm or yarn

### 💾 Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   node server.js
   ```

   The server will start on `http://localhost:5001` 🌐

### 🔄 Development Mode

For development with auto-restart:

```bash
npm install -g nodemon
nodemon server.js
```

## 📁 Project Structure

```text
backend/
├── models/
│   └── GameRoom.js           # Core game logic and room management
├── services/
│   └── BotAI.js             # AI bot intelligence system
├── handlers/
│   └── socketHandlers.js    # Socket.io event handlers
├── config/
│   └── constants.js         # Game constants and configuration
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎮 Core Features

### Real-time Multiplayer

- **Socket.io Integration**: WebSocket-based communication for instant updates
- **Room Management**: Create and join game rooms with unique codes
- **Player Synchronization**: Real-time game state across all connected players
- **Connection Handling**: Graceful handling of player disconnections and reconnections

### Game Logic Engine

- **Round Management**: Complete round lifecycle with timing and state transitions
- **Rule System**: Progressive rules that activate as players are eliminated
- **Scoring System**: Point calculation and elimination tracking (-10 points elimination)
- **AI Bot System**: Intelligent bots with playing card themed names and personalities
- **Real-time Updates**: Live game state synchronization across all connected players

### Room System

- **Unique Room Codes**: 6-character alphanumeric codes for easy sharing
- **Player Capacity**: Maximum 5 players per room
- **Auto-fill Bots**: Automatically add AI players to maintain 5-player games
- **Room State Management**: Track all active rooms and their game states
- **Player State Management**: Track player readiness, choices, and game participation

## 🤖 AI Bot System

### Bot Names & Personalities

The server includes 16 unique playing card themed bot names:

**Kings** (Aggressive: Risk 0.8, Calculation 0.6):

- King of Hearts
- King of Spades  
- King of Diamonds
- King of Clubs

**Queens** (Balanced: Risk 0.5, Calculation 0.8):

- Queen of Diamonds
- Queen of Hearts
- Queen of Clubs
- Queen of Spades

**Jacks** (Unpredictable: Risk 0.7, Calculation 0.4):

- Jack of Hearts
- Jack of Diamonds
- Jack of Spades
- Jack of Clubs

**Aces** (Mathematical: Risk 0.3, Calculation 0.9):

- Ace of Hearts
- Ace of Diamonds
- Ace of Spades
- Ace of Clubs

### Bot Intelligence

- **Strategic Decision Making**: Bots adapt their choices based on active game rules
- **Unique Selection Algorithm**: Fisher-Yates shuffle ensures unique bot names per room
- **Personality-Based Play**: Each card type has distinct risk tolerance and calculation focus
- **Rule Awareness**: AI understands and responds to duplicate penalties, perfect targets, and zero-hundred gambit
- **Dynamic Strategy**: Early game, mid game, and end game strategies with 3-15 second response delays

## 🎯 API Endpoints

### REST API

**POST `/api/create-room`**

- Creates a new game room
- Returns room code and initial game state
- Auto-generates unique 6-character room ID

### Socket.io Events

#### Client → Server Events

```javascript
// Join a game room
socket.emit('joinRoom', { roomId, playerId, playerName })

// Submit number choice for current round
socket.emit('makeChoice', { roomId, playerId, choice })

// Request to start game (when players are ready)
socket.emit('startGame', { roomId })

// Mark player as ready for next round
socket.emit('playerReady', { roomId, playerId })
```

#### Server → Client Events

```javascript
// Room state updates
socket.emit('roomUpdated', {
  players: [...],
  gameState: 'waiting|countdown|playing|finished',
  currentRound: number,
  activeRules: [...],
  roundHistory: [...]
})

// Round results with player data
socket.emit('roundResult', { 
  round: number,
  choices: [...],
  average: number,
  target: number, 
  winner: string,
  timeoutPlayers: [...],
  eliminatedThisRound: [...],
  players: [...] // includes hasLeft property
})

// Game completion
socket.emit('gameFinished', { 
  winner: string, 
  finalScores: [...] 
})

// Real-time choice updates
socket.emit('choiceUpdate', {
  chosenCount: number,
  totalActivePlayers: number,
  lastPlayerName: string,
  timestamp: number
})

// Ready status updates
socket.emit('readyUpdate', {
  readyCount: number,
  totalActive: number,
  allReady: boolean
})

// Round countdown
socket.emit('nextRoundCountdown', seconds)

// Error handling
socket.emit('error', { message })
```

## 🎲 Game Logic Implementation

### GameRoom Class

The core game logic is managed by the `GameRoom` class:

```javascript
class GameRoom {
  constructor(roomId, hostId, io) {
    this.roomId = roomId
    this.hostId = hostId
    this.io = io
    this.players = new Map()
    this.gameState = 'waiting'
    this.currentRound = 0
    this.eliminatedCount = 0
    this.maxPlayers = 5
    this.minPlayers = 1
    this.roundTimeLimit = 60
    this.nextRoundDelay = 10
    this.botAI = new BotAI()
  }

  // Core methods
  addPlayer(playerId, playerName, isBot)
  removePlayer(playerId) // Marks as left during active games
  startGame()
  processRound()
  checkEliminations()
  fillWithBots()
  playerReady(playerId)
}
```

### Round Processing

1. **Number Collection**: Gather all active player choices within 60-second time limit
2. **Target Calculation**: Calculate target = (average × 0.8)
3. **Winner Determination**: Find player closest to target
4. **Rule Application**: Apply active rules (duplicates, perfect target, zero-hundred)
5. **Point Distribution**: Update player scores (-1 for non-winners, -2 for timeout)
6. **Elimination Check**: Remove players at -10 points
7. **Rule Activation**: Enable new rules based on elimination count

### Progressive Rules System

#### Always Active: Timeout Penalty

```javascript
// Players who don't submit lose 2 points
if (!player.hasChosenThisRound) {
  player.score -= 2;
}
```

#### After 1 Elimination: Duplicate Penalty

```javascript
// Find duplicate numbers and penalize
if (choiceCounts[choice] > 1) {
  player.score -= 1;
}
```

#### After 2 Eliminations: Perfect Target Rule

```javascript
// Exact target match penalizes others
if (exactMatch) {
  otherPlayers.forEach(p => p.score -= 2);
}
```

#### After 3 Eliminations: Zero-Hundred Gambit

```javascript
// Special rule: if one chooses 0 and another 100
if (zeroPlayer && hundredPlayer) {
  winner = hundredPlayer;
}
```

## ⚡ Performance & Scalability

### Memory Management

- **Room Cleanup**: Automatic removal of empty rooms
- **Connection Tracking**: Efficient player connection management
- **State Optimization**: Minimal game state storage

### Concurrent Games

- **Multiple Rooms**: Support for unlimited concurrent game rooms
- **Isolated State**: Each room maintains independent game state
- **Resource Efficient**: Lightweight room objects with minimal overhead

### Error Handling

- **Connection Drops**: Graceful handling of player disconnections
- **Invalid Moves**: Validation of all player inputs
- **Room Not Found**: Proper error responses for invalid room codes
- **Game State Errors**: Recovery from unexpected game states

## 🔧 Configuration

### Environment Variables

```bash
PORT=5001                    # Server port
NODE_ENV=development         # Environment mode
CORS_ORIGIN=http://localhost:5173  # Frontend URL for CORS
```

### Server Configuration

```javascript
const cors = require('cors')
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}))
```

## 📊 Monitoring & Debugging

### Logging

The server includes comprehensive logging for:

- Player connections and disconnections
- Room creation and deletion
- Game state transitions
- Error conditions
- Bot decision making
- Player state management

### Debug Information

```javascript
// Room status logging
console.log(`Room ${roomCode}: ${players.length} players, Round ${currentRound}`)

// Bot selection logging
console.log(`Added bot: ${botName} to room ${roomCode}`)

// Game result logging
console.log(`Round result: Target ${target}, Winner: ${winner}`)

// Choice tracking
console.log(`Choice update: ${chosenCount}/${activePlayers.length} players chosen`)
```

## 🧪 Testing

### Manual Testing

1. **Single Player**: Test solo play with 4 bots
2. **Multiplayer**: Test with multiple browser tabs
3. **Rule Progression**: Verify rules activate correctly
4. **Player Connections**: Test disconnect/reconnect scenarios
5. **Edge Cases**: Test timeouts, eliminations, invalid inputs

### Test Scenarios

- **Room Creation**: Verify unique room codes
- **Player Joining**: Test room capacity limits
- **Game Flow**: Complete game from start to finish
- **Bot Behavior**: Verify AI decision making with different personalities
- **Rule Activation**: Test each rule independently
- **Connection Handling**: Verify proper state management when players disconnect

## 🔧 Configuration

### Environment Variables

```bash
PORT=5001                    # Server port (default if not specified)
NODE_ENV=development         # Environment mode
CORS_ORIGIN=http://localhost:5173  # Frontend URL for CORS
```

### Server Configuration

```javascript
const cors = require('cors')
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}))

// Socket.io with CORS enabled
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})
```

### Game Constants (config/constants.js)

```javascript
const GAME_CONSTANTS = {
  MAX_PLAYERS: 5,
  MIN_PLAYERS: 1,
  ROUND_TIME_LIMIT: 60,        // 60 seconds per round
  NEXT_ROUND_DELAY: 10,        // 10 seconds between rounds
  ELIMINATION_SCORE: -10,      // Elimination threshold
  TIMEOUT_PENALTY: -2,         // Penalty for not choosing
  DUPLICATE_PENALTY: -1,       // Penalty for duplicate number
  PERFECT_TARGET_PENALTY: -2   // Penalty for hitting target exactly
}

// Bot personality configurations
const BOT_PERSONALITIES = {
  KINGS: { riskTolerance: 0.8, calculationAccuracy: 0.6 },
  QUEENS: { riskTolerance: 0.5, calculationAccuracy: 0.8 },
  JACKS: { riskTolerance: 0.7, calculationAccuracy: 0.4 },
  ACES: { riskTolerance: 0.3, calculationAccuracy: 0.9 }
}
```

## 🤝 Contributing

### Code Style

- Use ES6+ modern JavaScript features
- Follow modular architecture patterns
- Comment complex game logic and AI decisions
- Maintain consistent error handling and logging
- Use meaningful variable and function names

### Development Guidelines

1. **Game Logic**: Test all rule changes thoroughly across multiple rounds
2. **Bot AI**: Ensure AI personalities remain distinct and challenging
3. **Real-time Features**: Test Socket.io events under various network conditions
4. **Connection Handling**: Verify proper state management when players disconnect
5. **Performance**: Monitor memory usage with multiple concurrent rooms
6. **Documentation**: Update README and code comments for any API changes

### Testing Checklist

- [ ] Room creation and joining works correctly
- [ ] All 4 progressive rules activate at proper rounds (3, 6, 9, 12)
- [ ] Bot personalities show distinct behavior patterns
- [ ] Player connections handle properly during network issues
- [ ] Elimination at -10 points functions properly
- [ ] Real-time updates synchronize across all clients

---

**🎮 Powering the King of Diamonds experience with robust real-time multiplayer infrastructure and intelligent AI opponents!** 👑💎
