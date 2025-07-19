# 🏗️ King of Diamonds Backend - Modular Architecture 💎

## 📋 Project Structure

The backend has been refactored from a monolithic `server.js` file into a clean, modular architecture for better maintainability, testing, and scalability.

```
backend/
├── config/
│   └── constants.js          # Game configuration constants
├── handlers/
│   └── socketHandlers.js     # Socket.IO event handlers
├── models/
│   └── GameRoom.js          # Game room model and logic
├── routes/
│   └── api.js               # REST API routes
├── services/
│   └── BotAI.js            # AI bot implementation
├── utils/
│   └── gameUtils.js        # Game utility functions
└── server.js               # Main server file
```

## 🎯 Module Responsibilities

### 📊 `config/constants.js`
- **Purpose**: Centralized configuration and constants
- **Contains**:
  - Bot names and personalities
  - Game configuration (max players, timeouts, penalties)
  - Server configuration (ports, CORS)
  - Rule activation thresholds
  - Bot AI configuration

### 🤖 `services/BotAI.js`
- **Purpose**: AI bot intelligence and decision-making
- **Features**:
  - Personality-based bot behaviors (Kings, Queens, Jacks, Aces)
  - Early/mid/end game strategies
  - Rule-aware decision making
  - Historical pattern analysis
  - Target prediction algorithms
  - Integer-only choice generation

### 🏠 `models/GameRoom.js`
- **Purpose**: Game room management and game logic
- **Features**:
  - Player management (add/remove/eliminate)
  - Round processing and timing
  - Rule application and scoring
  - Bot integration
  - Event emission to clients
  - Game state management

### 🌐 `routes/api.js`
- **Purpose**: REST API endpoints
- **Endpoints**:
  - `POST /api/create-room` - Create new game room
  - `POST /api/join-room` - Join existing room
  - `GET /api/room/:roomId` - Get room information
  - `GET /api/stats` - Server statistics
  - `GET /health` - Health check

### 🔌 `handlers/socketHandlers.js`
- **Purpose**: Socket.io real-time communication
- **Events**:
  - `joinRoom` - Player joins room
  - `startGame` - Host starts game
  - `makeChoice` - Player submits choice
  - `playerReady` - Player ready for next round
  - `disconnect` - Player disconnection handling
  - Automatic room cleanup

### 🛠️ `utils/gameUtils.js`
- **Purpose**: Utility functions and helpers
- **Functions**:
  - Input validation (names, choices, room IDs)
  - Data sanitization
  - Game statistics calculation
  - Rate limiting
  - Array shuffling
  - Time formatting

### 🎮 `server.js`
- **Purpose**: Main server orchestration (simplified)
- **Features**:
  - Express app setup
  - Socket.io initialization
  - Middleware configuration
  - Error handling
  - Graceful shutdown
  - Health monitoring

## 🔧 Key Improvements

### ✅ **Separation of Concerns**
- Each module has a single, well-defined responsibility
- AI logic separated from game logic
- Network handling separated from business logic
- Configuration centralized and reusable

### ✅ **Enhanced Maintainability**
- Smaller, focused files easier to understand
- Clear module boundaries
- Reduced code duplication
- Better error isolation

### ✅ **Improved Testability**
- Individual modules can be unit tested
- Mock dependencies easily
- Clear input/output contracts
- Isolated AI behavior testing

### ✅ **Better Scalability**
- Modules can be optimized independently
- Easy to add new features
- Clear extension points
- Microservice-ready architecture

### ✅ **Enhanced Security**
- Input validation centralized
- Rate limiting implemented
- Error handling improved
- Secure defaults

## 🚀 Usage Examples

### Creating a New Game Feature

1. **Add constants** in `config/constants.js`
2. **Implement logic** in appropriate model
3. **Add API endpoint** in `routes/api.js`
4. **Handle real-time events** in `handlers/socketHandlers.js`
5. **Add utilities** in `utils/gameUtils.js` if needed

### Modifying Bot AI

1. **Update personalities** in `config/constants.js`
2. **Modify strategies** in `services/BotAI.js`
3. **Test with different configurations**
4. **No other files need modification**

### Adding New API Endpoints

1. **Add route** in `routes/api.js`
2. **Use existing utilities** for validation
3. **Access game state** through `req.app.locals`
4. **Return consistent error formats**

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Example: Testing Bot AI
const BotAI = require('../services/BotAI');
const botAI = new BotAI();

test('Bot makes valid choice', () => {
  const choice = botAI.calculateBotChoice(mockBot, mockGameContext);
  expect(choice).toBeGreaterThanOrEqual(0);
  expect(choice).toBeLessThanOrEqual(100);
  expect(Number.isInteger(choice)).toBe(true);
});
```

### Integration Tests
```javascript
// Example: Testing API endpoints
const request = require('supertest');
const { app } = require('../server');

test('Create room endpoint', async () => {
  const response = await request(app)
    .post('/api/create-room')
    .send({ playerName: 'TestPlayer' });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('roomId');
  expect(response.body).toHaveProperty('playerId');
});
```

## 📊 Performance Monitoring

### Built-in Metrics
- Active rooms count
- Connected players count
- Memory usage tracking
- Request rate monitoring
- Error rate tracking

### Health Checks
- `/health` endpoint for load balancers
- Socket connection monitoring
- Automatic room cleanup
- Memory leak detection

## 🔄 Migration Notes

### From Old Structure
The modular approach breaks the game server into focused, single-responsibility modules.

### To New Structure
- Reduced main server to ~180 lines
- Clear separation of concerns
- Each module under 400 lines
- Easy to test and maintain
- Scalable architecture

## 🎯 Development Workflow

### Adding New Features
1. **Plan**: Identify which modules are affected
2. **Constants**: Add any new configuration
3. **Models**: Implement business logic
4. **Services**: Add supporting services (AI, external APIs)
5. **Routes**: Expose via REST API if needed
6. **Handlers**: Add real-time functionality
7. **Utils**: Add utilities as needed
8. **Test**: Unit and integration tests

### Debugging
1. **Check logs**: Each module logs its operations
2. **Use health endpoint**: Check system status
3. **Monitor metrics**: Built-in performance tracking
4. **Isolate modules**: Test individual components

## 🎮 Ready to Scale!

The modular architecture makes the King of Diamonds backend:
- **Easy to understand** 📖
- **Simple to maintain** 🔧
- **Ready to test** 🧪
- **Prepared to scale** 📈
- **Built for the future** 🚀

Each module focuses on doing one thing exceptionally well, making the entire system more robust and developer-friendly! 💎
