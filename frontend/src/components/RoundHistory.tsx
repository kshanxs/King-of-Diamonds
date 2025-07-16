import React from 'react';
import type { RoundResult } from '../types/game';

interface RoundHistoryProps {
  roundHistory: RoundResult[];
}

export const RoundHistory: React.FC<RoundHistoryProps> = ({ roundHistory }) => {
  if (!roundHistory || roundHistory.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-4">📊 Round History</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {roundHistory.map((round) => (
          <div key={round.round} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-semibold text-lg">Round {round.round}</span>
              <span className="text-diamond-400 font-bold">
                🏆 {round.winner}
              </span>
            </div>
            
            {round.choices.length > 0 ? (
              <>
                {/* Player Choices */}
                <div className="mb-3">
                  <h4 className="text-white/80 text-sm font-medium mb-2">Player Choices:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {round.choices.map((choice, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-lg text-sm ${
                          choice.timedOut 
                            ? 'bg-orange-500/20 border border-orange-500/30' 
                            : 'bg-blue-500/20 border border-blue-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={choice.timedOut ? 'text-orange-200' : 'text-blue-200'}>
                            {choice.name}
                          </span>
                          <span className={`font-bold ${choice.timedOut ? 'text-orange-300' : 'text-blue-300'}`}>
                            {choice.timedOut ? 'TIMEOUT' : choice.choice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Calculations */}
                <div className="bg-diamond-500/10 rounded-lg p-3 border border-diamond-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-white/60">Numbers:</p>
                      <p className="text-white font-mono">
                        [{round.choices.filter(c => !c.timedOut).map(c => c.choice).join(', ')}]
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60">Average:</p>
                      <p className="text-diamond-300 font-bold">
                        {round.average.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60">Target (×0.8):</p>
                      <p className="text-diamond-400 font-bold text-lg">
                        {round.target.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-orange-300 font-medium">⏰ All players timed out</p>
                <p className="text-orange-200/70 text-sm">No choices were made in time</p>
              </div>
            )}
            
            {/* Penalties and Eliminations */}
            <div className="flex flex-wrap gap-2 mt-3">
              {round.timeoutPlayers && round.timeoutPlayers.length > 0 && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1">
                  <span className="text-orange-200 text-xs font-medium">
                    Timeouts (-2): {round.timeoutPlayers.join(', ')}
                  </span>
                </div>
              )}
              {round.eliminatedThisRound.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1">
                  <span className="text-red-200 text-xs font-medium">
                    💀 Eliminated: {round.eliminatedThisRound.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
