import React from 'react';
import type { RoundResult } from '../types/game';

interface RoundResultModalProps {
  lastRoundResult: RoundResult;
  nextRoundCountdown: number | null;
  readyCount: number;
  totalReadyPlayers: number;
  gameState: string | undefined;
  onContinueClick: () => void;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  lastRoundResult,
  nextRoundCountdown,
  readyCount,
  totalReadyPlayers,
  gameState,
  onContinueClick
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Round {lastRoundResult.round} Results
        </h3>
        
        <div className="space-y-6">
          {lastRoundResult.choices.length > 0 ? (
            <>
              {/* Player Choices Grid */}
              <div>
                <h4 className="text-white/80 font-medium mb-3">Player Choices:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {lastRoundResult.choices.map((choice, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        choice.timedOut 
                          ? 'bg-orange-500/20 border border-orange-500/30' 
                          : 'bg-blue-500/20 border border-blue-500/30'
                      }`}
                    >
                      <span className={choice.timedOut ? 'text-orange-200' : 'text-blue-200'}>
                        {choice.name}
                      </span>
                      <span className={`font-bold text-lg ${choice.timedOut ? 'text-orange-300' : 'text-blue-300'}`}>
                        {choice.timedOut ? 'TIMEOUT' : choice.choice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="bg-diamond-500/10 rounded-lg p-4 border border-diamond-500/20">
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-white/60 text-sm">Valid Numbers:</p>
                    <p className="text-white font-mono">
                      [{lastRoundResult.choices.filter(c => !c.timedOut).map(c => c.choice).join(', ')}]
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Average:</p>
                    <p className="text-diamond-300 font-bold text-xl">
                      {lastRoundResult.average.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Target (Average × 0.8):</p>
                    <p className="text-diamond-400 font-bold text-2xl">
                      {lastRoundResult.target.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Winner */}
              <div className="text-center">
                <p className="text-xl font-bold text-diamond-400">
                  🏆 Winner: {lastRoundResult.winner}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-orange-300 text-lg font-medium">⏰ All players timed out</p>
              <p className="text-orange-200/70">No choices were made in time</p>
            </div>
          )}
          
          {lastRoundResult.timeoutPlayers && lastRoundResult.timeoutPlayers.length > 0 && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
              <p className="text-orange-200 font-semibold">Timed Out (-2 points):</p>
              <p className="text-orange-200">{lastRoundResult.timeoutPlayers.join(', ')}</p>
            </div>
          )}
          
          {lastRoundResult.eliminatedThisRound.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200 font-semibold">💀 Eliminated:</p>
              <p className="text-red-200">{lastRoundResult.eliminatedThisRound.join(', ')}</p>
            </div>
          )}
        </div>
        
        {/* Next Round Timer & Ready Status */}
        {nextRoundCountdown !== null && nextRoundCountdown > 0 && (
          <div className="text-center py-2">
            <p className="text-white/60 text-sm">Next round starts in:</p>
            <p className="text-diamond-400 font-bold text-lg">{nextRoundCountdown}s</p>
            {readyCount > 0 && totalReadyPlayers > 0 && (
              <div className="mt-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-green-300 text-xs">
                    {readyCount} / {totalReadyPlayers} players ready
                  </p>
                </div>
                {readyCount === totalReadyPlayers && totalReadyPlayers > 0 && (
                  <p className="text-green-400 text-xs mt-1 animate-bounce">
                    All ready! Starting immediately... 🚀
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={onContinueClick}
          className={`glass-button w-full mt-6 transition-all duration-300 ${
            nextRoundCountdown !== null && nextRoundCountdown <= 0 && gameState !== 'finished'
              ? 'animate-pulse !bg-red-500/30 border-red-500/50' 
              : ''
          }`}
        >
          {gameState === 'finished' 
            ? 'View Final Results' 
            : nextRoundCountdown !== null && nextRoundCountdown <= 0
            ? 'Round Started! Click to Continue'
            : 'Continue'
          }
        </button>
      </div>
    </div>
  );
};
