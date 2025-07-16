import React from 'react';

interface GameCountdownProps {
  countdown: number;
}

export const GameCountdown: React.FC<GameCountdownProps> = ({ countdown }) => {
  return (
    <div className="glass-card p-8 text-center">
      <h2 className="text-4xl font-bold text-white mb-4">Game Starting...</h2>
      <div className="text-8xl font-bold text-diamond-400 animate-pulse">
        {countdown}
      </div>
    </div>
  );
};
