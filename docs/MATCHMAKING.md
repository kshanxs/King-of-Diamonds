# 🎯 King of Diamonds - Matchmaking System 💎

## 📋 Overview

The King of Diamonds game features a simple but effective room-based matchmaking system that allows players to create and join game rooms easily. The system is designed for quick setup and seamless multiplayer experiences.

## 🏠 Room System

### Room Creation
- **Unique Room Codes**: 6-character alphanumeric codes (e.g., "ABC123")
- **Instant Creation**: Rooms are created immediately when requested
- **Host Assignment**: First player becomes the room host
- **Auto-fill Ready**: Rooms automatically fill with AI bots when game starts

### Room Management
- **Maximum Capacity**: 5 players per room (including AI bots)
- **Minimum Players**: 1 human player required to start
- **Room Persistence**: Rooms exist until all players leave
- **Auto Cleanup**: Empty rooms are automatically removed

## 🎮 Game Modes

### Solo Mode
1. Player creates a room
2. Clicks "Start Game" immediately
3. 4 AI bots are automatically added
4. Game begins with 5 total players

### Multiplayer Mode
1. Host creates a room and shares the room code
2. Friends join using the room code
3. Host starts the game when ready
4. Remaining slots are filled with AI bots (if needed)
5. Game begins with up to 5 total players

## 🤖 AI Bot Integration

### Automatic Bot Assignment
- **Smart Filling**: Bots are added to maintain 5-player games
- **Instant Availability**: No waiting for additional human players
- **Playing Card Names**: Each bot has a unique playing card identity
- **Balanced Teams**: AI ensures competitive gameplay regardless of human player count
- **Bot Assignment Toggle**: The host can enable or disable automatic bot assignment for players who leave mid-game.

### Bot Pool
The system includes 16 available AI opponents:
- **4 Kings**: Aggressive risk-takers
- **4 Queens**: Balanced calculators  
- **4 Jacks**: Unpredictable wildcards
- **4 Aces**: Mathematical precision experts

## 🔗 Room Joining Process

### Creating a Room
1. Player enters their name on homepage
2. Clicks "Create Room" button
3. System generates unique 6-character room code
4. Player is automatically joined as host
5. Room code is displayed for sharing

### Joining a Room
1. Player enters their name on homepage
2. Enters a valid room code
3. Clicks "Join Room" button
4. System validates room exists and has space
5. Player is added to the room

### Room Code Features
- **Easy Sharing**: Simple 6-character format
- **Copy Function**: One-click room code copying
- **Paste Support**: Smart text parsing for room codes
- **Case Insensitive**: Codes work regardless of capitalization

## ⚡ Real-time Features

### Live Room Updates
- **Player List**: Real-time updates when players join/leave
- **Status Tracking**: See who's ready, choosing, or eliminated
- **Connection Status**: Track active and disconnected players
- **Game State**: Live synchronization of all game events

### Connection Handling
- **Graceful Disconnects**: Players can rejoin active games
- **Host Migration**: Automatic host reassignment if host leaves
- **Game Continuation**: Games continue with remaining players
- **Bot Substitution**: Disconnected players are marked as "left" and can be replaced by a bot.

## 🎯 Matchmaking Flow

### Quick Match Flow
```
Player → Enter Name → Create Room → Start Game → Play with 4 AI Bots
```

### Friend Match Flow
```
Host: Enter Name → Create Room → Share Code → Start Game
Friends: Enter Name → Enter Code → Join Room → Wait for Start
```

## 🔧 Technical Implementation

### Room Storage
- **In-Memory Map**: Rooms stored in server memory
- **Unique IDs**: UUID-based room identification
- **Player Tracking**: Socket connection mapping
- **State Management**: Complete game state persistence

### Code Generation
- **Format**: 6 alphanumeric characters
- **Collision Avoidance**: Regeneration if code exists
- **Human Readable**: Excludes confusing characters (0, O, I, l)
- **Easy Sharing**: Short enough for voice communication

### API Endpoints
- `POST /api/create-room`: Creates new game room
- `POST /api/join-room`: Joins existing room
- `GET /api/room/:roomId`: Gets room information

### Socket Events
- `joinRoom`: Join a game room
- `playerJoined`: Notify room of new player
- `playerLeft`: Handle player disconnection
- `startGame`: Begin game session

## 🎪 Player Experience

### Seamless Entry
- **No Registration**: Just enter a name and play
- **Instant Rooms**: No waiting for matchmaking queues
- **Friend-Friendly**: Easy room code sharing
- **Mobile Optimized**: Works perfectly on all devices

### Smart Defaults
- **Auto-fill Bots**: No waiting for full rooms
- **Quick Start**: Can begin playing immediately
- **Fair Competition**: AI maintains game balance
- **Flexible Group Sizes**: Works with 1-5 human players

## 🔒 Room Security

### Access Control
- **Room Code Required**: Can't join without valid code
- **Capacity Limits**: Maximum 5 players enforced
- **Game State Protection**: Only valid moves accepted
- **Input Validation**: All player actions validated

### Rate Limiting
- **API Protection**: Limited room creation requests
- **Abuse Prevention**: Prevents room flooding
- **Fair Access**: Ensures system availability

## 📊 Current Status

The matchmaking system is **fully implemented and production-ready**:

✅ **Room Creation & Management**: Complete
✅ **Player Joining System**: Complete  
✅ **AI Bot Integration**: Complete
✅ **Real-time Updates**: Complete
✅ **Connection Handling**: Complete
✅ **Error Management**: Complete
✅ **Mobile Support**: Complete

The system provides a smooth, immediate gaming experience where players can start playing within seconds of opening the game, either solo or with friends.

---

**Ready to create your room and challenge friends to a battle of wits?** 🎮💎
