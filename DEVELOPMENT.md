# Development Guide - Balance of Diamonds

## 🚀 Quick Start for Development

### Option 1: Using the Startup Script (Recommended)
```bash
./start-game.sh
```

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open your browser to: `http://localhost:5173`

## 🎮 Testing the Game

### Single Player Testing
1. Open the game in your browser
2. Enter your name
3. Click "Create Room"
4. Click "Start Game" (bots will auto-fill)
5. Play against AI opponents

### Multiplayer Testing
1. Open the game in multiple browser tabs/windows
2. Create a room in the first tab
3. Note the room code displayed
4. Join the same room from other tabs using the room code
5. Start the game when ready

### Game Flow Testing
1. **Waiting Room**: Test room creation and joining
2. **Game Start**: 3-second countdown before first round
3. **Round Play**: Number selection from 0-100 grid
4. **Round Results**: View target calculation and winner
5. **Rule Progression**: Watch rules unlock as players are eliminated
6. **Game End**: Final scores and winner display

## 🧪 Testing Scenarios

### Rule Testing
- **Basic Game**: Play with 2-5 players to test basic mechanics
- **Duplicate Rule**: Wait for 1 elimination, then have multiple players choose the same number
- **Exact Target Rule**: Wait for 2 eliminations, try to guess the exact target
- **0/100 Rule**: Wait for 3 eliminations, test the special 0/100 interaction

### Edge Cases
- **Empty Room**: Test room cleanup when all players leave
- **Host Leaving**: Test what happens when room creator leaves
- **Network Issues**: Test reconnection and error handling
- **Invalid Inputs**: Test with invalid room codes, names, etc.

## 🛠️ Development Notes

### Code Structure
```
frontend/src/
├── components/          # React components
│   ├── HomePage.tsx    # Landing page and room creation
│   ├── GameRoom.tsx    # Main game interface
│   ├── LoadingSpinner.tsx
│   └── GameFinished.tsx
├── services/           # API and Socket services
│   ├── apiService.ts   # REST API calls
│   └── socketService.ts # Socket.io connection
├── types/              # TypeScript definitions
│   └── game.ts         # Game state interfaces
└── App.tsx             # Main app component

backend/
└── server.js           # Express + Socket.io server
```

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Build**: Vite for fast development and builds

### Environment Setup
- **Backend Port**: 5001
- **Frontend Port**: 5173 (Vite default)
- **CORS**: Configured for local development

## 🎨 UI Development

### Glassmorphism Classes
```css
.glass-card     /* Main card backgrounds */
.glass-button   /* Interactive buttons */
.glass-input    /* Form inputs */
.number-button  /* Number selection grid */
```

### Color Scheme
- **Primary**: Diamond blue (#0ea5e9)
- **Background**: Purple-to-pink gradient
- **Glass Effects**: White with opacity
- **Text**: White with various opacities

### Responsive Design
- **Mobile First**: Tailwind's responsive utilities
- **Touch Friendly**: Large tap targets on mobile
- **Grid Layout**: Adaptive number button grid

## 🤖 Bot AI Logic

### Bot Decision Making
1. **First Round**: Choose random number between 40-60
2. **Subsequent Rounds**: Adapt based on previous round targets
3. **Rule Adaptation**: Adjust strategy when new rules activate
4. **Randomization**: Add slight randomness to avoid predictability

### Bot Names
- AliceBot, CheshireAI, QueenBot, MadHatterAI
- WhiteRabbitBot, CaterpillarAI, TweedleBot, DormouseAI

## 🐛 Debugging

### Common Issues
1. **Port Conflicts**: Backend uses 5001, frontend uses 5173
2. **CORS Errors**: Check origin settings in server.js
3. **Socket Connection**: Verify backend is running before frontend
4. **Build Errors**: Check TypeScript types and imports

### Debug Tools
- **Browser DevTools**: Network tab for API calls
- **React DevTools**: Component state inspection
- **Console Logs**: Server and client logging
- **Socket.io Inspector**: Browser extension for socket events

## 📝 Adding New Features

### Adding New Game Rules
1. Update `backend/server.js` - modify `getActiveRules()` and `processRound()`
2. Update `frontend/src/types/game.ts` if needed
3. Test thoroughly with multiple players

### Adding New UI Components
1. Create component in `frontend/src/components/`
2. Add TypeScript interfaces in `types/game.ts`
3. Import and use in main components
4. Apply glassmorphism styling classes

### Adding New API Endpoints
1. Add route in `backend/server.js`
2. Add service method in `frontend/src/services/apiService.ts`
3. Use in components as needed

## 🚢 Deployment Considerations

### Production Build
```bash
cd frontend
npm run build
```

### Environment Variables
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Frontend URL for CORS

### Performance
- Vite provides optimized production builds
- Socket.io handles connection scaling
- Consider implementing rate limiting for production
