import React, { useState, useEffect } from 'react';

interface NetworkInfo {
  localIP: string;
  lanURL: string;
  isHost: boolean;
}

interface GameServer {
  ip: string;
  players: number;
  rooms: number;
  status: string;
}

export const NetworkDiscovery: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<GameServer[]>([]);
  const [shareableURL, setShareableURL] = useState<string>('');

  useEffect(() => {
    // Get current network info
    const localIP = window.location.hostname;
    const port = window.location.port || '5173';
    const lanURL = `http://${localIP}:${port}`;
    
    setNetworkInfo({
      localIP,
      lanURL,
      isHost: localIP !== 'localhost' && localIP !== '127.0.0.1'
    });

    setShareableURL(lanURL);
  }, []);

  const scanForServers = async () => {
    setIsScanning(true);
    setFoundServers([]);
    
    const localIP = window.location.hostname;
    
    // Only scan if we're on a LAN IP
    if (localIP === 'localhost' || localIP === '127.0.0.1') {
      setIsScanning(false);
      return;
    }

    const ipBase = localIP.substring(0, localIP.lastIndexOf('.'));
    const servers: GameServer[] = [];

    // Scan a limited range for performance
    const scanPromises = [];
    for (let i = 1; i <= 20; i++) {
      const testIP = `${ipBase}.${i}`;
      if (testIP === localIP) continue; // Skip own IP
      
      scanPromises.push(
        fetch(`http://${testIP}:5001/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'ok') {
            servers.push({
              ip: testIP,
              players: data.players || 0,
              rooms: data.rooms || 0,
              status: data.status
            });
          }
        })
        .catch(() => {
          // Server not found or not responding
        })
      );
    }

    await Promise.all(scanPromises);
    setFoundServers(servers);
    setIsScanning(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const generateQRCode = () => {
    // Simple QR code URL generation
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableURL)}`;
    return qrURL;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-4">🌐 LAN Multiplayer</h3>
      
      {networkInfo && (
        <div className="space-y-4">
          {/* Current Network Info */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-200 mb-2">Your Network Info:</h4>
            <p className="text-sm text-white/70 mb-1">IP: {networkInfo.localIP}</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-white/70 flex-1">Share: {shareableURL}</p>
              <button
                onClick={() => copyToClipboard(shareableURL)}
                className="glass-button px-2 py-1 text-xs"
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>

          {/* QR Code for easy mobile sharing */}
          {networkInfo.isHost && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-green-200 mb-2">📱 QR Code for Mobile</h4>
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                className="mx-auto mb-2 rounded-lg"
                style={{ maxWidth: '150px' }}
              />
              <p className="text-sm text-white/70">
                Scan with phone to join game
              </p>
            </div>
          )}

          {/* Hosting Status */}
          {networkInfo.isHost ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-200 mb-2">🎮 Hosting on LAN</h4>
              <p className="text-sm text-white/70">
                Players on your network can join using your IP address. 
                Make sure the backend server is running on port 5001.
              </p>
            </div>
          ) : (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-orange-200 mb-2">💻 Local Development</h4>
              <p className="text-sm text-white/70">
                You're running on localhost. To enable LAN play, access this page 
                using your computer's IP address instead.
              </p>
            </div>
          )}

          {/* Server Discovery */}
          <div className="space-y-2">
            <button
              onClick={scanForServers}
              disabled={isScanning || !networkInfo.isHost}
              className="glass-button w-full py-2 disabled:opacity-50"
            >
              {isScanning ? '🔍 Scanning Network...' : '🔍 Find LAN Games'}
            </button>

            {!networkInfo.isHost && (
              <p className="text-xs text-white/50 text-center">
                Network scanning only available when accessing via IP address
              </p>
            )}
          </div>

          {/* Found Servers */}
          {foundServers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Found Game Servers:</h4>
              {foundServers.map(server => (
                <div
                  key={server.ip}
                  className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">🎯 {server.ip}</p>
                      <p className="text-xs text-white/70">
                        {server.players} players • {server.rooms} rooms
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(`http://${server.ip}:5173`, '_blank')}
                      className="glass-button px-3 py-1 text-sm"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Connection */}
          <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-gray-200 mb-2">🔗 Manual Connection</h4>
            <p className="text-sm text-white/70 mb-2">
              Know someone's IP? Connect directly:
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="192.168.1.100"
                className="glass-input flex-1 text-sm py-2 px-3"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const ip = (e.target as HTMLInputElement).value;
                    if (ip) {
                      window.open(`http://${ip}:5173`, '_blank');
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="192.168.1.100"]') as HTMLInputElement;
                  const ip = input?.value;
                  if (ip) {
                    window.open(`http://${ip}:5173`, '_blank');
                  }
                }}
                className="glass-button px-3 py-2 text-sm"
              >
                Connect
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-200 mb-2">📖 How LAN Play Works</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• All devices must be on the same WiFi network</li>
              <li>• Host starts backend server (npm start) on port 3001</li>
              <li>• Players join using host's IP address</li>
              <li>• No internet required - works offline!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
