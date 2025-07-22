# 📖 King of Diamonds Documentation

Welcome to the comprehensive documentation for King of Diamonds - a real-time multiplayer number guessing game. This directory contains all guides, references, and technical documentation needed for development, deployment, and understanding the game mechanics.

## 📑 Quick Navigation

| Category | Document | Description |
|----------|----------|-------------|
| **🎮 Game & Rules** | [`GAME_RULES.md`](./GAME_RULES.md) | Complete game rules, mechanics, and strategy guide |
| **⚙️ Development** | [`DEVELOPMENT.md`](./DEVELOPMENT.md) | Development environment setup and testing |
| **🌐 Networking & Deployment** | [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production deployment and hosting guide |
| | [`LAN_SETUP.md`](./LAN_SETUP.md) | Local network multiplayer configuration |
| | [`MATCHMAKING.md`](./MATCHMAKING.md) | Matchmaking system and room management |
| **📋 Technical Documentation** | [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) | High-level implementation overview |
| | [`TIMEOUT_ELIMINATION_FEATURE.md`](./TIMEOUT_ELIMINATION_FEATURE.md) | Timeout elimination system |
| | [`ZERO_HUNDRED_BUG_FIX.md`](./ZERO_HUNDRED_BUG_FIX.md) | Zero-hundred rule implementation fix |

## 🏗️ Architecture Documentation

### Backend

- [`backend/README.md`](./backend/README.md) - API documentation and endpoints
- [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) - Backend architecture and design patterns
- [`backend/AI_SYSTEM_README.md`](./backend/AI_SYSTEM_README.md) - AI bot system documentation

### Frontend

- [`frontend/README.md`](./frontend/README.md) - Component documentation and UI architecture

## 🚀 Quick Start Guides

### For Players

1. Read [`GAME_RULES.md`](./GAME_RULES.md) to understand the game mechanics
2. Check [`LAN_SETUP.md`](./LAN_SETUP.md) for local multiplayer setup

### For Developers

1. Start with [`DEVELOPMENT.md`](./DEVELOPMENT.md) for environment setup
2. Review [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) for system design
3. Check [`frontend/README.md`](./frontend/README.md) for component structure

### For Deployment

1. Follow [`DEPLOYMENT.md`](./DEPLOYMENT.md) for production deployment
2. Use [`LAN_SETUP.md`](./LAN_SETUP.md) for local network games

## 🔧 Feature Documentation

### Game Features

- **Real-time Multiplayer**: Socket.io based real-time communication
- **AI Bots**: Intelligent bot opponents with adaptive strategies
- **LAN Support**: Local network multiplayer with automatic discovery
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Bot Assignment Toggle**: Host can enable/disable bot assignment for leaving players.

### Technical Features

- **TypeScript Frontend**: React + TypeScript with Vite
- **Node.js Backend**: Express + Socket.io server
- **Docker Support**: Containerized deployment options
- **QR Code Integration**: Easy room sharing via QR codes
- **Health Monitoring**: Backend health check endpoint.

## 📊 Project Status

This documentation covers all current features and implementation details. For the latest changes and development progress, see the main project README.md.

## 🤝 Contributing

When contributing to the project:

1. Update relevant documentation alongside code changes
2. Follow the established documentation structure
3. Keep guides up-to-date with implementation changes

---

**Last updated:** December 2024
