import React from 'react';

interface GameHeaderProps {
  roomId: string;
  currentRound: number;
  onLeaveRoom: () => void;
  onCopyRoomCode: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  currentRound,
  onLeaveRoom,
  onCopyRoomCode
}) => {
  return (
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
        <button
          onClick={onLeaveRoom}
          className="glass-button !bg-red-500/20 hover:!bg-red-500/30"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};
