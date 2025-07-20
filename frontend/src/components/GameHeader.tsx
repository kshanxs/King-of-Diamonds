import React, { useState, useEffect, useRef } from 'react';
import { NetworkDiscovery } from './NetworkDiscovery';

interface GameHeaderProps {
  roomId: string;
  currentRound: number;
  gameState?: string; // Add optional gameState prop
  onLeaveRoom: () => void;
  onCopyRoomCode: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  currentRound,
  gameState,
  onLeaveRoom,
  onCopyRoomCode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNetworkDiscovery, setShowNetworkDiscovery] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hide hamburger menu in lobby state
  const showHamburgerMenu = gameState !== 'waiting';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleShowNetworkDiscovery = () => {
    setShowNetworkDiscovery(!showNetworkDiscovery);
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-2xl font-bold text-white">Room: {roomId}</h1>
              <button
                onClick={onCopyRoomCode}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-diamond-300"
                title="Copy room code"
              >
                📋
              </button>
            </div>
            <p className="text-white/70">Round {currentRound || 0}</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Hamburger Menu - Hidden in lobby */}
            {showHamburgerMenu && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
                  title="Menu"
                >
                  <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                    <div className="w-6 h-0.5 bg-white"></div>
                    <div className="w-6 h-0.5 bg-white"></div>
                    <div className="w-6 h-0.5 bg-white"></div>
                  </div>
                </button>

                {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 glass-card p-4 min-w-48 z-50">
                  <div className="space-y-2">
                    <button
                      onClick={handleShowNetworkDiscovery}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
                    >
                      � LAN Multiplayer
                    </button>
                    <button
                      onClick={() => {
                        window.open(`http://${window.location.hostname}:5173`, '_blank');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
                    >
                      🔗 Share LAN Link
                    </button>
                    <div className="border-t border-white/20 my-2"></div>
                    <button
                      onClick={() => {
                        onCopyRoomCode();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-white transition-all duration-200"
                    >
                      📋 Copy Room Code
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}

            <button
              onClick={onLeaveRoom}
              className="glass-button !bg-red-500/20 hover:!bg-red-500/30"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>

      {/* Network Discovery Modal */}
      {showNetworkDiscovery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">� LAN Multiplayer</h3>
              <button
                onClick={() => setShowNetworkDiscovery(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>
            <NetworkDiscovery />
          </div>
        </div>
      )}
    </>
  );
};
