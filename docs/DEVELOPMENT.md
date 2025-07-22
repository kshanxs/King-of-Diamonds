# Development Guide - King of Diamonds

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
- Playing card themed names from actual implementation:
  - **Kings**: King of Hearts, King of Spades, King of Diamonds, King of Clubs
  - **Queens**: Queen of Diamonds, Queen of Hearts, Queen of Clubs, Queen of Spades
  - **Jacks**: Jack of Hearts, Jack of Diamonds, Jack of Spades, Jack of Clubs
  - **Aces**: Ace of Hearts, Ace of Diamonds, Ace of Spades, Ace of Clubs

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
1. Update game logic in `backend/models/GameRoom.js` 
2. Modify `getActiveRules()` and `processRound()` methods
3. Update frontend types in `frontend/src/types/game.ts` if needed
4. Test thoroughly with multiple players

### Adding New UI Components
1. Create component in `frontend/src/components/`
2. Add TypeScript interfaces in `types/game.ts`
3. Import and use in main components
4. Apply glassmorphism styling classes

### Adding New API Endpoints
1. Add route in `backend/routes/api.js`
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
