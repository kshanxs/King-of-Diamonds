import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { GameRoom } from './components/GameRoom';
import './index.css';

type AppState = 'home' | 'game';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');

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
  };

  return (
    <div className="App">
      {currentState === 'home' && (
        <HomePage
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      )}
      {currentState === 'game' && (
        <GameRoom
          roomId={roomId}
          playerId={playerId}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
