# 👑 King of Diamonds - Frontend 💎

React + TypeScript frontend for the King of Diamonds multiplayer strategy game.

## 🛠️ Tech Stack

- **⚛️ React 18** - Modern React with hooks and concurrent features
- **📝 TypeScript** - Type safety and better developer experience
- **⚡ Vite** - Fast build tool with hot module replacement
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🔌 Socket.io Client** - Real-time communication with backend

## 🚀 Getting Started

### 📋 Prerequisites

- 📦 Node.js (v18+ recommended)
- 📦 npm or yarn

### 💾 Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` 🌐

### 🏗️ Building for Production

```bash
npm run build
```

Built files will be in the `dist` directory. 📁

## 📁 Project Structure

```text
src/
├── components/              # React components
│   ├── GameRoom.tsx        # Main game interface
│   ├── LiveLeaderboard.tsx # Real-time leaderboard display
│   ├── RoundResultModal.tsx # Round results display
│   ├── GamePlaying.tsx     # Number selection interface
│   ├── GameCountdown.tsx   # Game start countdown
│   └── HomePage.tsx        # Landing page
├── hooks/                   # Custom React hooks
│   └── useGameRoom.ts      # Game state management hook
├── services/               # API and Socket services
│   ├── api.ts             # REST API calls
│   └── socketService.ts   # Socket.io connection
├── types/                  # TypeScript definitions
│   └── game.ts            # Game-related type definitions
├── index.css              # Global styles with playing cards theme
└── main.tsx               # Application entry point
```

## 🎨 Key Features

### Real-time Gameplay

- **Socket.io Integration**: Live game state synchronization
- **Smart Round Progression**: 10-second countdown with early start when all players ready
- **Player Status Tracking**: Real-time updates on who's choosing, ready, or connected

### Modern UI/UX

- **Glassmorphism Design**: Beautiful translucent card-table aesthetic
- **Playing Card Theme**: Card-inspired background patterns and visual elements
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: CSS transitions and hover effects
- **Live Leaderboard**: Dynamic sorting and real-time player standings

### User Experience

- **Copy Room Codes**: One-click clipboard integration for easy sharing
- **Paste Functionality**: Smart text parsing for room code entry
- **Visual Feedback**: Clear indication of game state and player actions
- **Error Handling**: Graceful error states and user feedback
- **Real-time Updates**: Live game state and player status synchronization

## 🎮 Components Overview

### HomePage.tsx
The landing page where players enter their name and join/create games.

**Features:**
- Player name input with validation
- Room creation for solo play with AI
- Room joining with code input
- Paste functionality for room codes
- Responsive layout

### GameRoom.tsx
The main game interface where the King of Diamonds game is played.

**Features:**
- Number selection grid (0-100)
- Real-time player list with status indicators
- Round result modal with detailed breakdown
- Active rules display
- Game timer with visual countdown
- Left player tracking
- Room code sharing functionality

### Socket Service
Handles all real-time communication with the backend server.

**Events Handled:**
- Player joins/leaves
- Game state updates
- Round results
- Rule activations
- Timer synchronization

### API Service
Manages REST API calls for room creation and basic operations.

**Endpoints:**
- `POST /api/create-room` - Create new game room
- Room validation and player management

## 🎨 Styling & Theme

### Tailwind CSS Configuration
Custom utilities and components for the glassmorphism theme:

```css
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}

.glass-button {
  @apply glass-card hover:bg-white/20 transition-all duration-200;
}
```

### Playing Card Background
SVG-based card suit patterns create an authentic casino atmosphere:
- Card suit symbols (♠ ♥ ♦ ♣)
- Layered background gradients
- Responsive pattern scaling

### Color Palette
- **Primary**: Diamond-inspired blues and whites
- **Accents**: Card suit colors (red hearts/diamonds, black spades/clubs)
- **Glass Effects**: Semi-transparent whites with backdrop blur

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### TypeScript Configuration
The project uses strict TypeScript settings for better type safety:
- Strict mode enabled
- No implicit any
- Strict null checks
- All strict options enabled

### ESLint Setup
Configured with React and TypeScript rules for code quality.

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Key responsive features:
- Adaptive layouts
- Touch-friendly interfaces
- Optimized number grids for mobile
- Responsive modals and overlays

## ⚡ Performance

### Optimization Features
- **Vite Hot Reload**: Instant development feedback
- **Tree Shaking**: Remove unused code in production
- **Asset Optimization**: Compressed images and assets
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components

### Bundle Size
- Modern ES modules
- Minimal dependencies
- Optimized Tailwind CSS purging

## 🧪 Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow React hooks patterns
- Implement proper error boundaries
- Use semantic HTML elements

### State Management
- Local component state for UI
- Socket events for game state
- Context API for global app state
- No external state management library needed

### Testing Considerations
- Components designed for testability
- Clear separation of concerns
- Mock-friendly API and Socket services

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Test components thoroughly
4. Ensure responsive design works
5. Maintain glassmorphism aesthetic

---

**🎯 Built with modern React and TypeScript for the ultimate King of Diamonds experience!** 👑💎
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
