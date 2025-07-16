import React, { useState } from 'react';
import { apiService } from '../services/apiService';

interface HomePageProps {
  onRoomCreated: (roomId: string, playerId: string) => void;
  onRoomJoined: (roomId: string, playerId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRoomCreated, onRoomJoined }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError('Failed to create room. Please try again.');
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
      setError('Please enter room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      onRoomJoined(roomCode.trim().toUpperCase(), response.playerId);
    } catch (err: any) {
      setError(err.message || 'Failed to join room. Please try again.');
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

        {/* Main Card */}
        <div className="glass-card p-8 space-y-6">
          {/* Player Name Input */}
          <div>
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
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm">
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
          <div className="mt-8 p-4 bg-white/5 rounded-xl">
            <h3 className="text-white font-semibold mb-2">How to Play:</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Choose a number from 0-100 each round</li>
              <li>• Get closest to target (average × 0.8) to win</li>
              <li>• Lose points if you don't win</li>
              <li>• Last player standing wins!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
