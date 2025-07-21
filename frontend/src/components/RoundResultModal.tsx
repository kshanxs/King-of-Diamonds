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
  const [hasClicked, setHasClicked] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Show modal with animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Reset hasClicked when a new round starts
  React.useEffect(() => {
    setHasClicked(false);
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [lastRoundResult.round]);
  
  const handleClick = () => {
    if (hasClicked) return; // Prevent multiple clicks
    setHasClicked(true);
    onContinueClick();
  };
  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`glass-card p-4 max-w-lg w-full max-h-screen overflow-hidden flex flex-col transition-all duration-500 ease-out ${
          isVisible ? 'transform translate-y-0 scale-100' : 'transform translate-y-8 scale-95'
        }`}
      >
        {/* Header with Title, Countdown, and Continue Button */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: Countdown Timer */}
          <div className="flex-1">
            {nextRoundCountdown !== null && nextRoundCountdown > 0 && (
              <div className="text-left">
                <p className="text-white/60 text-xs">Next round in:</p>
                <p className="text-diamond-400 font-bold text-lg">{nextRoundCountdown}s</p>
                {readyCount > 0 && totalReadyPlayers > 0 && (
                  <div className="mt-1">
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-green-300 text-xs">
                        {readyCount}/{totalReadyPlayers} ready
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Center: Title */}
          <h3 className="text-lg font-bold text-white text-center flex-1">
            Round {lastRoundResult.round} Results
          </h3>
          
          {/* Right: Continue Button */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleClick}
              disabled={hasClicked}
              className={`glass-button px-3 py-1.5 text-sm transition-all duration-300 ${
                hasClicked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : nextRoundCountdown !== null && nextRoundCountdown <= 0 && gameState !== 'finished'
                  ? 'animate-pulse !bg-red-500/30 border-red-500/50' 
                  : ''
              }`}
            >
              {hasClicked 
                ? '✓ Ready'
                : gameState === 'finished' 
                ? 'Final Results' 
                : nextRoundCountdown !== null && nextRoundCountdown <= 0
                ? 'Continue'
                : 'Continue'
              }
            </button>
          </div>
        </div>
        
        <div className="flex-1 space-y-3 min-h-0">
          {lastRoundResult.choices.length > 0 ? (
            <>
              {/* Player Choices Grid */}
              <div>
                <h4 className="text-white/80 font-medium mb-2 text-sm">Player Choices:</h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-80 overflow-y-auto">
                  {lastRoundResult.choices.map((choice, index) => {
                    const isWinner = choice.name === lastRoundResult.winner;
                    return (
                      <div 
                        key={index} 
                        className={`p-2 rounded-lg text-sm ${
                          isWinner
                            ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-400/50'
                            : choice.timedOut 
                              ? 'bg-orange-500/20 border border-orange-500/30' 
                              : 'bg-blue-500/20 border border-blue-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs ${
                            isWinner ? 'text-yellow-200 font-bold' :
                            choice.timedOut ? 'text-orange-200' : 'text-blue-200'
                          }`}>
                            {isWinner && '👑 '}{choice.name}{isWinner && gameState === 'finished' && ' (WINNER)'}
                          </span>
                          <span className={`font-bold ${
                            isWinner ? 'text-yellow-300' :
                            choice.timedOut ? 'text-orange-300' : 'text-blue-300'
                          }`}>
                            {choice.timedOut ? 'TIMEOUT' : choice.choice}
                          </span>
                        </div>
                        {choice.pointLosses && choice.pointLosses.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {choice.pointLosses.map((loss, lossIndex) => (
                              <div key={lossIndex} className="flex justify-between items-center text-xs">
                                <span className="text-red-300">{loss.reason}</span>
                                <span className="text-red-400 font-semibold">{loss.points > 0 ? `-${loss.points}` : loss.points} pts</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isWinner && (
                          <div className="mt-1 text-xs">
                            <span className="text-yellow-300 font-semibold">
                              🏆 {gameState === 'finished' ? 'Game Winner!' : 'Round Winner!'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculations */}
              <div className="bg-diamond-500/10 rounded-lg p-3 border border-diamond-500/20">
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-white/60 text-xs">Valid Numbers:</p>
                    <p className="text-white font-mono text-xs">
                      [{lastRoundResult.choices.filter(c => !c.timedOut).map(c => c.choice).join(', ')}]
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Average:</p>
                    <p className="text-diamond-300 font-bold text-lg">
                      {lastRoundResult.average.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Target (Avg × 0.8):</p>
                    <p className="text-diamond-400 font-bold text-xl">
                      {lastRoundResult.target.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Messages */}
              {lastRoundResult.timeoutPlayers && lastRoundResult.timeoutPlayers.length > 0 && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-2">
                  <p className="text-orange-200 font-semibold text-xs">Timed Out (-2 pts):</p>
                  <p className="text-orange-200 text-xs">{lastRoundResult.timeoutPlayers.join(', ')}</p>
                </div>
              )}
              
              {lastRoundResult.eliminatedThisRound.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                  <p className="text-red-200 font-semibold text-xs">💀 Eliminated:</p>
                  <p className="text-red-200 text-xs">{lastRoundResult.eliminatedThisRound.join(', ')}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-orange-300 text-lg font-medium">⏰ All players timed out</p>
              <p className="text-orange-200/70">No choices were made in time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
