import React, { memo } from 'react';

interface GameLobbyProps {
  playersCount: number;
  isHost: boolean;
  roomId: string;
  onStartGame: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = memo(({
  playersCount,
  isHost,
  roomId,
  onStartGame
}) => {
  return (
    <div className="glass-card p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Game Lobby</h2>
      <p className="text-white/70 mb-6">
        {playersCount} / 5 players joined
      </p>
      {isHost && (
        <div className="space-y-4">
          {playersCount === 1 ? (
            <>
              <button
                onClick={onStartGame}
                className="glass-button text-xl px-8 py-4 !bg-diamond-500/20 hover:!bg-diamond-500/30"
              >
                Start Solo (With AI Opponents)
              </button>
              <p className="text-white/50 text-sm">
                Play against 4 AI opponents for strategic solo gameplay
              </p>
            </>
          ) : (
            <>
              <button
                onClick={onStartGame}
                className="glass-button text-xl px-8 py-4"
              >
                Start Multiplayer Game
              </button>
              <p className="text-white/50 text-sm">
                Playing with {playersCount} human players
                {playersCount < 5 && ` + ${5 - playersCount} AI opponents`}
              </p>
            </>
          )}
          <div className="text-xs text-white/40 mt-2">
            Room Code: <span className="font-mono font-bold text-diamond-300">{roomId}</span>
          </div>
        </div>
      )}
    </div>
  );
});
