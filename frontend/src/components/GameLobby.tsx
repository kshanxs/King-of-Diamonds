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
      // Haptic feedback (vibration) for mobile
      triggerHaptic();
      const shareText = !networkInfo.isLocal 
        ? `Join my King of Diamonds game!\nRoom Code: ${roomId}\nLAN URL: ${networkInfo.frontendURL}`
        : `Join my King of Diamonds game!\nRoom Code: ${roomId}`;
      
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy room info:', err);
      // Fallback for older browsers
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(30);
      }
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
    <>
      <div className="glass-card p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-8">
          {/* Left: Lobby Info (stacked on mobile) */}
          <div className="flex flex-col items-start justify-center w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white flex items-center gap-2 mb-2 sm:mb-4">
              🎮 Game Lobby
            </h2>
            <span className="text-white/70 text-base">{playersCount} / 5 players joined</span>
          </div>
          {/* Right: Room Code and QR Invite (stacked on mobile) */}
          <div className="flex flex-col w-full sm:w-auto mt-2 sm:mt-0">
            <div className="flex flex-row items-center w-full sm:max-w-[180px]">
              <span className="text-white/70 text-sm mr-2">Room Code:</span>
              <button
                onClick={e => {
                  triggerHaptic();
                  handleCopyRoomInfo();
                }}
                className={`text-diamond-300 text-base font-mono bg-black/30 px-3 py-1 rounded-xl border border-diamond-400/30 shadow transition-all duration-200 focus:outline-none active:scale-95 w-full ${copySuccess ? 'bg-green-500/30 text-green-200' : 'hover:bg-white/10 hover:text-diamond-400'}`}
                title={copySuccess ? 'Copied!' : 'Click to copy room code'}
                style={{ borderRadius: '0.75rem', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
              >
                {roomId} {copySuccess ? '✅' : ''}
              </button>
            </div>
            {/* QR Invite button below room code, full width on mobile */}
            {!networkInfo.isLocal && (
              <button
                onClick={e => {
                  triggerHaptic();
                  setShowQR(true);
                }}
                className="glass-button text-base font-semibold mt-2 w-full sm:max-w-[180px]"
                style={{ borderRadius: '0.75rem', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
              >
                📱 QR Invite
              </button>
            )}
          </div>
        </div>

        {/* Bot Assignment & Start Game - no extra glass effect */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8 mb-4">
            {/* Bot Assignment Control for non-admins only */}
            {playersCount > 1 && !isHost && (
              <div className="w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 max-w-2xl mx-auto">
                  <div className="flex flex-row items-center gap-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <button
                        className="glass-button flex items-center justify-center gap-2 text-white/80 text-sm font-medium px-4 py-2 border border-diamond-400/20 shadow w-full sm:w-[180px]"
                        style={{
                          borderRadius: '0.75rem',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
                          pointerEvents: 'none',
                          cursor: 'default',
                          opacity: 0.7
                        }}
                        title={botAssignmentEnabled ? 'Bot Replace ON' : 'Bot Replace OFF'}
                        tabIndex={-1}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          botAssignmentEnabled
                            ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse'
                            : 'bg-orange-400 shadow-lg shadow-orange-400/50'
                        }`} />
                        <span style={{ display: 'inline-block', width: '100px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {botAssignmentEnabled ? 'Bot Replace ON' : 'Bot Replace OFF'}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* No description shown */}
                </div>
              </div>
            )}
            {/* LAN Info removed from main lobby UI */}
          </div>

          {/* Start Game section - visually grouped and centered */}
          {isHost && (
            <div className="space-y-6 mt-6 flex flex-col items-center justify-center">
              {/* Bot Replace button above Start Game for admins */}
              {playersCount > 1 && (
                <button
                  onClick={() => {
                    triggerHaptic();
                    const newValue = !botAssignmentEnabled;
                    onToggleBotAssignment(newValue);
                  }}
                  className="glass-button flex items-center justify-center gap-2 text-white/80 text-sm font-medium px-4 py-2 border border-diamond-400/20 shadow w-full sm:w-[180px] transition-all duration-200 focus:outline-none active:scale-95"
                  style={{ borderRadius: '0.75rem', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
                  title={botAssignmentEnabled ? 'Turn Bot Replace OFF' : 'Turn Bot Replace ON'}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    botAssignmentEnabled
                      ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse'
                      : 'bg-orange-400 shadow-lg shadow-orange-400/50'
                  }`} />
                  <span style={{ display: 'inline-block', width: '100px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {botAssignmentEnabled ? 'Bot Replace ON' : 'Bot Replace OFF'}
                  </span>
                </button>
              )}
              {playersCount === 1 ? (
                <>
                  <button
                    onClick={e => {
                      triggerHaptic();
                      onStartGame();
                    }}
                    className="glass-button text-xl px-8 py-4 !bg-diamond-500/80 hover:!bg-diamond-500/90 font-bold shadow-lg w-full sm:w-auto"
                  >
                    Start Solo Game
                  </button>
                  <p className="text-white/60 text-base mt-4 text-center">
                    Play against <span className="font-bold text-diamond-300">4 AI opponents</span> for strategic solo gameplay
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={e => {
                      triggerHaptic();
                      onStartGame();
                    }}
                    className="glass-button text-xl px-8 py-4 !bg-diamond-500/80 hover:!bg-diamond-500/90 font-bold shadow-lg w-full sm:w-auto"
                  >
                    Start Multiplayer Game
                  </button>
                  <p className="text-white/60 text-base mt-4 text-center">
                    Playing with <span className="font-bold text-diamond-300">{playersCount} human players</span>
                    {playersCount < 5 && <span> + <span className="font-bold text-diamond-300">{5 - playersCount} AI opponents</span></span>}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal Popup */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
          <div className="glass-card max-w-md w-full p-6 text-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">📱 Lobby Invite QR Code</h3>
            {qrLoading ? (
              <div className="w-64 h-64 bg-white/10 rounded-xl flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
            ) : qrDataUrl ? (
              <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                <img src={qrDataUrl} alt="QR Code for Lobby Invite" className="w-64 h-64 mx-auto" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white/10 rounded-xl flex items-center justify-center text-white/50 text-xs">
                QR generation failed
              </div>
            )}
            {/* LAN URL below QR code */}
            {!networkInfo.isLocal && (
              <div className="text-xs text-white/70 mb-4">
                LAN URL: <span className="font-mono text-diamond-300">{networkInfo.frontendURL}</span>
              </div>
            )}
            <p className="text-white/70 text-sm mb-4">
              Scan this QR code to join this King of Diamonds lobby
            </p>
            <button onClick={e => { triggerHaptic(); setShowQR(false); }} className="glass-button w-full">
              Return to Lobby
            </button>
          </div>
        </div>
      )}
    </>
  );
});
