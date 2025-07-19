import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { NetworkDiscovery } from './NetworkDiscovery';

interface HomePageProps {
  onRoomCreated: (roomId: string, playerId: string) => void;
  onRoomJoined: (roomId: string, playerId: string) => void;
}

type GameMode = 'online' | 'lan';

export const HomePage: React.FC<HomePageProps> = ({ onRoomCreated, onRoomJoined }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('online');

  const handlePasteRoomCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Clean the text and extract room code (6 characters, alphanumeric)
      const cleanText = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanText.length >= 6) {
        setRoomCode(cleanText.substring(0, 6));
      } else if (cleanText.length > 0) {
        setRoomCode(cleanText);
      }
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.createRoom(playerName.trim());
      onRoomCreated(response.roomId, response.playerId);
    } catch (err: any) {
      setError(err.message || 'Failed to create room. Please try again.');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      onRoomJoined(roomCode.trim().toUpperCase(), response.playerId);
    } catch (err: any) {
      setError(err.message || 'Failed to join room. Please check the room code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-float">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            💎
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            King of Diamonds
          </h2>
          <p className="text-white/70 text-lg">
            Rule the realm through cunning calculation and diamond-sharp strategy.
          </p>
        </div>

        {/* Game Mode Toggle */}
        <div className="flex glass-card p-2 mb-6 rounded-2xl">
          <button
            onClick={() => setGameMode('online')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              gameMode === 'online'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            🌐 Online Play
          </button>
          <button
            onClick={() => setGameMode('lan')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              gameMode === 'lan'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            🏠 Local Play
          </button>
        </div>

        {/* Game Mode Content */}
        <div className="relative min-h-[500px]">
          {/* Online Mode Card */}
          <div className={`glass-card p-6 transition-all duration-500 ease-in-out ${
            gameMode === 'online' 
              ? 'opacity-100 transform translate-x-0 scale-100' 
              : 'opacity-0 transform translate-x-full scale-95 absolute inset-0 pointer-events-none'
          }`}>
            <h2 className="text-xl font-bold text-white mb-4 text-center">🌐 Online Multiplayer</h2>
            
            {/* Player Name Input */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="glass-input w-full"
                maxLength={20}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="glass-button w-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/50">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="glass-input flex-1"
                    maxLength={6}
                  />
                  <button
                    onClick={handlePasteRoomCode}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-diamond-300"
                    title="Paste room code"
                  >
                    📋
                  </button>
                </div>
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="glass-button w-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>

            {/* Game Rules Preview */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">How to Play:</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Choose a number from 0-100 each round</li>
                <li>• Get closest to target (average × 0.8) to win</li>
                <li>• Lose points if you don't win</li>
                <li>• Last player standing wins!</li>
              </ul>
            </div>
          </div>

          {/* LAN Mode Card */}
          <div className={`glass-card p-6 transition-all duration-500 ease-in-out ${
            gameMode === 'lan' 
              ? 'opacity-100 transform translate-x-0 scale-100' 
              : 'opacity-0 transform -translate-x-full scale-95 absolute inset-0 pointer-events-none'
          }`}>
            <h2 className="text-xl font-bold text-white mb-4 text-center">🏠 LAN Multiplayer</h2>
            
            {/* Player Name Input */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="glass-input w-full"
                maxLength={20}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Network Discovery */}
            <div className="mb-6">
              <NetworkDiscovery />
            </div>

            {/* Manual Room Options */}
            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="glass-button w-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Create LAN Room'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/50">OR JOIN EXISTING</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="glass-input flex-1"
                    maxLength={6}
                  />
                  <button
                    onClick={handlePasteRoomCode}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-diamond-300"
                    title="Paste room code"
                  >
                    📋
                  </button>
                </div>
                <button
                  onClick={handleJoinRoom}
                  disabled={loading}
                  className="glass-button w-full text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join LAN Room'}
                </button>
              </div>
            </div>

            {/* LAN Info */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">🏠 LAN Features:</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Auto-discover games on your network</li>
                <li>• No internet required</li>
                <li>• QR codes for mobile connection</li>
                <li>• Connect all devices on same WiFi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
