# 🔥 New Feature: Timeout Elimination Rule 💀

## 📋 What's New

Added a new **timeout elimination rule** to improve game flow and handle unresponsive players.

## ⚡ How It Works

### Before (Old Rule)
- No response = -2 points penalty
- Players could timeout indefinitely and still stay in game

### After (New Rule)
- **1st timeout**: -2 points penalty (same as before)
- **2nd consecutive timeout**: Player is immediately **eliminated** 💀
- **Reset condition**: Timeout count resets when player makes a choice

## 🎯 Benefits

1. **Better Game Flow**: Eliminates players who consistently don't participate
2. **Prevents Griefing**: Stops players from intentionally timing out to slow the game
3. **Maintains Engagement**: Keeps active players engaged without waiting for unresponsive ones
4. **Fair Warning**: Players get one warning (first timeout) before elimination

## 🛠️ Technical Implementation

### Changes Made

1. **Player Object**: Added `timeoutCount` property to track consecutive timeouts
2. **Timeout Logic**: Enhanced timeout processing with elimination logic
3. **Rules Display**: Updated rules text to show elimination warning
4. **Round Recording**: Enhanced round results to track timeout eliminations
5. **Constants**: Added `TIMEOUT_ELIMINATION_THRESHOLD` configuration

### Files Modified

- `backend/models/GameRoom.js` - Main game logic
- `backend/config/constants.js` - Added new constant
- `docs/GAME_RULES.md` - Updated rule documentation  
- `README.md` - Updated feature summary

## 📊 Game Flow Example

```
Round 1: Player A times out → -2 points, timeoutCount = 1
Round 2: Player A makes choice → timeoutCount resets to 0
Round 3: Player A times out → -2 points, timeoutCount = 1  
Round 4: Player A times out → ELIMINATED! 💀
```

## 🎮 Player Experience

Players will now see:
- **Rule Display**: "No input within time limit → Lose 2 points (2nd timeout = elimination)"
- **Elimination Notice**: When a player is eliminated by timeout in round results
- **Clear Consequences**: Immediate feedback that consistent timeouts lead to elimination

This feature makes the game more competitive and ensures that only engaged players remain in the match! 🚀
