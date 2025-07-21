import React, { memo, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { getLocalNetworkInfo } from '../config/environment';
import { triggerHaptic } from '../utils/haptics';

interface GameLobbyProps {
  playersCount: number;
  isHost: boolean;
  roomId: string;
  botAssignmentEnabled: boolean;
  onStartGame: () => void;
  onToggleBotAssignment: (enabled: boolean) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = memo(({
  playersCount,
  isHost,
  roomId,
  botAssignmentEnabled,
  onStartGame,
  onToggleBotAssignment
}) => {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const networkInfo = getLocalNetworkInfo();

  useEffect(() => {
    const generateQRCode = async () => {
      if (networkInfo.isLocal) return;
      
      setQrLoading(true);
      try {
        const url = `${networkInfo.frontendURL}?room=${roomId}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 120,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        if (dataUrl && dataUrl.length > 50) {
          setQrDataUrl(dataUrl);
        } else {
          throw new Error('Invalid QR code generated');
        }
      } catch (err) {
        console.error('QR code generation error:', err);
        try {
          const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${networkInfo.frontendURL}?room=${roomId}`)}`;
          setQrDataUrl(fallbackUrl);
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
      triggerHaptic();
      const shareText = !networkInfo.isLocal 
        ? `Join my King of Diamonds game!\nRoom Code: ${roomId}\nLAN URL: ${networkInfo.frontendURL}`
        : `Join my King of Diamonds game!\nRoom Code: ${roomId}`;
      
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy room info:', err);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
      }
      const textArea = document.createElement('textarea');
      textArea.value = !networkInfo.isLocal 
        ? `Join my King of Diamonds game!\nRoom Code: ${roomId}\nLAN URL: ${networkInfo.frontendURL}`
        : `Join my King of Diamonds game!\nRoom Code: ${roomId}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <>
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-3">
              <span role="img" aria-label="joystick">🎮</span>
              Game Lobby
            </h2>
            <p className="text-white/70 text-sm sm:text-base mt-1">{playersCount} / 5 players joined</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center bg-black/30 rounded-xl border border-diamond-400/30 px-3 py-2">
              <span className="text-white/70 text-sm mr-2">Room:</span>
              <span className="text-diamond-300 text-lg font-mono">{roomId}</span>
              <button
                onClick={handleCopyRoomInfo}
                className="ml-3 text-white/80 hover:text-white transition-colors duration-200"
                title={copySuccess ? 'Copied!' : 'Copy room info'}
              >
                {copySuccess ? <CheckIcon /> : <ClipboardIcon />}
              </button>
            </div>
            {!networkInfo.isLocal && (
              <button
                onClick={() => setShowQR(true)}
                className="glass-button text-sm font-semibold flex items-center justify-center gap-2"
              >
                <QRIcon />
                <span>QR Invite</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {isHost ? (
            <div className="space-y-6 flex flex-col items-center">
              {playersCount > 1 && (
                <ToggleButton
                  label="Bot Replacement"
                  enabled={botAssignmentEnabled}
                  onToggle={onToggleBotAssignment}
                />
              )}
              <StartGameButton playersCount={playersCount} onStart={onStartGame} />
            </div>
          ) : (
            <div className="text-center text-white/80">
              <p>Waiting for the host to start the game...</p>
              {playersCount > 1 && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-1.5 rounded-full">
                    <div className={`w-2.5 h-2.5 rounded-full ${botAssignmentEnabled ? 'bg-green-400' : 'bg-orange-400'}`} />
                    <span>Bot Replacement is {botAssignmentEnabled ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showQR && (
        <QRCodeModal 
          qrDataUrl={qrDataUrl} 
          qrLoading={qrLoading} 
          frontendURL={networkInfo.frontendURL} 
          onClose={() => setShowQR(false)} 
        />
      )}
    </>
  );
});

const StartGameButton: React.FC<{ playersCount: number; onStart: () => void; }> = ({ playersCount, onStart }) => (
  <div className="text-center">
    <button
      onClick={() => { triggerHaptic(); onStart(); }}
      className="glass-button text-lg px-8 py-4 !bg-diamond-500/80 hover:!bg-diamond-500/90 font-bold shadow-lg w-full sm:w-auto"
    >
      {playersCount === 1 ? 'Start Solo Game' : 'Start Multiplayer Game'}
    </button>
    <p className="text-white/60 text-sm mt-3">
      {playersCount === 1 ? (
        <>Play against <span className="font-bold text-diamond-300">4 AI opponents</span></>
      ) : (
        <>
          With <span className="font-bold text-diamond-300">{playersCount} human players</span>
          {playersCount < 5 && <> + <span className="font-bold text-diamond-300">{5 - playersCount} AI</span></>}
        </>
      )}
    </p>
  </div>
);

const ToggleButton: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void; }> = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-center gap-3">
    <span className="text-white/80 text-sm font-medium">{label}</span>
    <button
      onClick={() => { triggerHaptic(); onToggle(!enabled); }}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </div>
);

const QRCodeModal: React.FC<{ qrDataUrl: string; qrLoading: boolean; frontendURL: string; onClose: () => void; }> = ({ qrDataUrl, qrLoading, frontendURL, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="glass-card max-w-sm w-full p-6 text-center animate-scale-in" onClick={e => e.stopPropagation()}>
      <h3 className="text-xl font-bold text-white mb-4">📱 Invite via QR</h3>
      <div className="bg-white p-4 rounded-xl mb-4 inline-block shadow-lg">
        {qrLoading ? (
          <div className="w-48 h-48 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          </div>
        ) : qrDataUrl ? (
          <img src={qrDataUrl} alt="Lobby QR Code" className="w-48 h-48 mx-auto" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-gray-500 text-xs">
            QR generation failed
          </div>
        )}
      </div>
      {frontendURL && (
        <div className="text-xs text-white/70 mb-4">
          LAN: <span className="font-mono text-diamond-300">{frontendURL}</span>
        </div>
      )}
      <p className="text-white/70 text-sm mb-4">Scan to join the lobby instantly.</p>
      <button onClick={() => { triggerHaptic(); onClose(); }} className="glass-button w-full">
        Close
      </button>
    </div>
  </div>
);

// SVG Icons for better visuals
const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const QRIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);