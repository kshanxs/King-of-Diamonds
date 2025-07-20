import React from 'react';
import type { Player } from '../types/game';

interface GameFinishedProps {
  winner: string;
  finalScores: Player[];
  onNewGame: () => void;
  reason?: string;
}

export const GameFinished: React.FC<GameFinishedProps> = ({ 
  winner, 
  finalScores, 
  onNewGame,
  reason 
}) => {
  const isNoHumansLeft = reason === 'no_humans';
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">{isNoHumansLeft ? '🤖' : '🏆'}</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Game Over!
          </h2>
          <p className="text-xl text-diamond-400 font-semibold">
            {isNoHumansLeft ? (
              <span className="text-orange-400">Game terminated - only bots remaining</span>
            ) : (
              <>Winner: {winner}</>
            )}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-white font-semibold mb-4">Final Scores:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {finalScores
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    index === 0 
                      ? 'bg-yellow-500/20 border border-yellow-500/30' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className={`font-semibold ${
                    index === 0 ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {index + 1}. {player.name} {player.isBot && '🤖'}
                  </span>
                  <span className={`font-bold ${
                    index === 0 ? 'text-yellow-300' : 'text-white/70'
                  }`}>
                    {player.score}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={onNewGame}
          className="glass-button w-full text-lg font-bold"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};
