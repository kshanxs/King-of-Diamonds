import React, { memo, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { getLocalNetworkInfo } from '../config/environment';

interface GameLobbyProps {
  playersCount: number;
  isHost: boolean;
  roomId: string;
  botAssignmentEnabled: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onToggleBotAssignment: (enabled: boolean) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = memo(({
  playersCount,
  isHost,
  roomId,
  botAssignmentEnabled,
  onStartGame,
  onLeaveRoom,
  onToggleBotAssignment
}) => {
  console.log(`🎮 GameLobby rendering with botAssignmentEnabled: ${botAssignmentEnabled}`);
  
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const networkInfo = getLocalNetworkInfo();

    // Generate QR code locally for instant display
  useEffect(() => {
    const generateQRCode = async () => {
      if (networkInfo.isLocal) return;
      
      setQrLoading(true);
      try {
        // Include room code in URL for easier scanning
        const url = `${networkInfo.frontendURL}?room=${roomId}`;
        console.log('Generating QR for URL:', url);
        const dataUrl = await QRCode.toDataURL(url, {
          width: 120,
          margin: 2,
          color: {
            dark: '#000000',  // Black QR code
            light: '#ffffff'  // White background
          }
        });
        if (dataUrl && dataUrl.length > 50) { // Basic validation
          setQrDataUrl(dataUrl);
          console.log('QR code generated successfully');
        } else {
          throw new Error('Invalid QR code generated');
        }
      } catch (err) {
        console.error('QR code generation error:', err);
        // Fallback to external API if local generation fails
        try {
          const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${networkInfo.frontendURL}?room=${roomId}`)}`;
          setQrDataUrl(fallbackUrl);
          console.log('Using fallback QR generation');
        } catch (fallbackErr) {
          console.error('Fallback QR generation also failed:', fallbackErr);
        }
      } finally {
        setQrLoading(false);
      }
    };

    if (!networkInfo.isLocal) {
      generateQRCode();
    }
  }, [networkInfo.frontendURL, networkInfo.isLocal, roomId]);

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

        {/* Bot Assignment Toggle - Only for multiplayer and host */}
        {isHost && playersCount > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <div className="text-left">
              <div className="text-white/90 text-sm">Bot Replacement</div>
              <div className="text-white/50 text-xs">
                {botAssignmentEnabled ? "Bots replace leavers" : "Leavers grayed out"}
              </div>
            </div>
            <button
              onClick={() => {
                const newValue = !botAssignmentEnabled;
                console.log(`🎮 GameLobby: Toggle clicked.`);
                console.log(`🎮   Current botAssignmentEnabled: ${botAssignmentEnabled}`);
                console.log(`🎮   New value to send: ${newValue}`);
                console.log(`🎮   Calling onToggleBotAssignment with: ${newValue}`);
                onToggleBotAssignment(newValue);
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                botAssignmentEnabled ? 'bg-diamond-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  botAssignmentEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

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
                {qrLoading ? (
                  <div className="w-[120px] h-[120px] bg-white/10 rounded-lg flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code for LAN connection"
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] bg-white/10 rounded-lg flex items-center justify-center text-white/50 text-xs">
                    QR generation failed
                  </div>
                )}
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
