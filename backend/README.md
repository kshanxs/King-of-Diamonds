# 🎮 King of Diamonds Backend 💎

## 📁 Current Server Files

### 🚀 `server.js` - **ACTIVE PRODUCTION SERVER**

- **Status**: ✅ Currently in use
- **Purpose**: Main server entry point using modular architecture
- **Size**: ~190 lines (down from 856!)
- **Features**: Clean, maintainable, scalable architecture

### 🗃️ `server-legacy-backup.js` - **LEGACY BACKUP**

- **Status**: 📦 Reference only - DO NOT USE
- **Purpose**: Original monolithic implementation (backup)
- **Size**: 856 lines of mixed concerns
- **Note**: Kept for reference during refactoring process

## 🏗️ Architecture Overview

The current system uses a **modular architecture** with clear separation of concerns:

```text
server.js (main entry point)
├── models/GameRoom.js (game logic)
├── services/BotAI.js (AI intelligence)  
├── handlers/socketHandlers.js (socket events)
├── routes/api.js (REST endpoints)
├── config/constants.js (configuration)
└── utils/gameUtils.js (utilities)
```

## 🎯 Key Benefits

- **Maintainable**: Each module has a single responsibility
- **Testable**: Easy to unit test individual components
- **Scalable**: Can easily add new features or scale components
- **Readable**: Clear separation makes code easier to understand

---

For detailed architecture documentation, see: `docs/backend/ARCHITECTURE.md`
