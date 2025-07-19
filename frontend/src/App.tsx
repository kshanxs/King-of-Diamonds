import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';
import './styles.css';

type AppState = 'home' | 'game';

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_STATE: 'kingOfDiamonds_currentState',
  ROOM_ID: 'kingOfDiamonds_roomId',
  PLAYER_ID: 'kingOfDiamonds_playerId',
};

function App() {
  // Initialize state from localStorage or defaults
  const [currentState, setCurrentState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
      return (saved as AppState) || 'home';
    } catch {
      return 'home';
    }
  });
  
  const [roomId, setRoomId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ROOM_ID) || '';
    } catch {
      return '';
    }
  });
  
  const [playerId, setPlayerId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PLAYER_ID) || '';
    } catch {
      return '';
    }
  });

  // Save state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, currentState);
    } catch (error) {
      console.warn('Failed to save currentState to localStorage:', error);
    }
  }, [currentState]);

  useEffect(() => {
    try {
      if (roomId) {
        localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
      }
    } catch (error) {
      console.warn('Failed to save roomId to localStorage:', error);
    }
  }, [roomId]);

  useEffect(() => {
    try {
      if (playerId) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
      }
    } catch (error) {
      console.warn('Failed to save playerId to localStorage:', error);
    }
  }, [playerId]);

  const handleRoomCreated = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setCurrentState('game');
  };

  const handleRoomJoined = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId);
    setPlayerId(newPlayerId);
    setCurrentState('game');
  };

  const handleLeaveRoom = () => {
    setRoomId('');
    setPlayerId('');
    setCurrentState('home');
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
      localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, 'home');
    } catch (error) {
      console.warn('Failed to clear game state from localStorage:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main App Routes */}
          <Route 
            path="/" 
            element={
              currentState === 'home' ? (
                <HomePage
                  onRoomCreated={handleRoomCreated}
                  onRoomJoined={handleRoomJoined}
                />
              ) : (
                <GameRoom
                  roomId={roomId}
                  playerId={playerId}
                  onLeaveRoom={handleLeaveRoom}
                />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
