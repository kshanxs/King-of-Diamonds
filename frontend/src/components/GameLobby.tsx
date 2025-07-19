import React, { memo, useState } from 'react';
import { getLocalNetworkInfo } from '../config/environment';

interface GameLobbyProps {
  playersCount: number;
  isHost: boolean;
  roomId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = memo(({
  playersCount,
  isHost,
  roomId,
  onStartGame,
  onLeaveRoom
}) => {
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const networkInfo = getLocalNetworkInfo();

  const generateQRCode = (text: string) => {
    const size = 120;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  };

  const handleCopyRoomInfo = async () => {
    try {
      const shareText = !networkInfo.isLocal 
        ? `Join my King of Diamonds game!\nRoom Code: ${roomId}\nLAN URL: ${networkInfo.frontendURL}`
        : `Join my King of Diamonds game!\nRoom Code: ${roomId}`;
      
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy room info:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      const shareText = !networkInfo.isLocal 
        ? `Join my King of Diamonds game!\nRoom Code: ${roomId}\nLAN URL: ${networkInfo.frontendURL}`
        : `Join my King of Diamonds game!\nRoom Code: ${roomId}`;
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="glass-card p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Game Lobby</h2>
      <p className="text-white/70 mb-6">
        {playersCount} / 5 players joined
      </p>

      {/* Room Information */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-white/70">Room Code:</span>
          <span className="font-mono font-bold text-diamond-300 text-lg">{roomId}</span>
        </div>

        {/* Single Copy Button */}
        <div className="flex justify-center mt-3">
          <button
            onClick={handleCopyRoomInfo}
            className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${
              copySuccess 
                ? 'bg-green-500/30 text-green-200' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Copy room information"
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy Room Info'}
          </button>
        </div>

        {/* LAN Info and QR Code */}
        {!networkInfo.isLocal && (
          <div className="space-y-2 mt-4">
            <div className="text-xs text-white/50">
              LAN URL: {networkInfo.frontendURL}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                {showQR ? '❌ Hide QR' : '📱 Show QR Code'}
              </button>
            </div>
            
            {showQR && (
              <div className="mt-3 flex justify-center">
                <img
                  src={generateQRCode(networkInfo.frontendURL)}
                  alt="QR Code for LAN connection"
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {isHost && (
        <div className="space-y-4">
          {playersCount === 1 ? (
            <>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onStartGame}
                  className="glass-button text-xl px-8 py-4 !bg-diamond-500/20 hover:!bg-diamond-500/30"
                >
                  Start Solo (With AI Opponents)
                </button>
                <button
                  onClick={onLeaveRoom}
                  className="glass-button text-lg px-6 py-4 !bg-red-500/20 hover:!bg-red-500/30"
                >
                  Leave Room
                </button>
              </div>
              <p className="text-white/50 text-sm">
                Play against 4 AI opponents for strategic solo gameplay
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onStartGame}
                  className="glass-button text-xl px-8 py-4"
                >
                  Start Multiplayer Game
                </button>
                <button
                  onClick={onLeaveRoom}
                  className="glass-button text-lg px-6 py-4 !bg-red-500/20 hover:!bg-red-500/30"
                >
                  Leave Room
                </button>
              </div>
              <p className="text-white/50 text-sm">
                Playing with {playersCount} human players
                {playersCount < 5 && ` + ${5 - playersCount} AI opponents`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
});
