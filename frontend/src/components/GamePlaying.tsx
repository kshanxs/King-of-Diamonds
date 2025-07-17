import React from 'react';
import { NumberGrid } from './NumberGrid';
import { ChoiceProgress } from './ChoiceProgress';

interface GamePlayingProps {
  currentRound: number;
  timeLeft: number | null;
  isEliminated: boolean;
  selectedNumber: number | null;
  chosenCount: number;
  totalActivePlayers: number;
  lastChoiceUpdate: {playerType: string; timestamp: number} | null;
  onNumberSelect: (number: number) => void;
  formatTime: (seconds: number) => string;
}

export const GamePlaying: React.FC<GamePlayingProps> = ({
  currentRound,
  timeLeft,
  isEliminated,
  selectedNumber,
  chosenCount,
  totalActivePlayers,
  lastChoiceUpdate,
  onNumberSelect,
  formatTime
}) => {
  const [showNumberGrid, setShowNumberGrid] = React.useState(true);
  const [isGridExiting, setIsGridExiting] = React.useState(false);

  // Handle number selection with exit animation
  const handleNumberSelect = (number: number) => {
    setIsGridExiting(true);
    // Delay the actual selection to allow exit animation
    setTimeout(() => {
      onNumberSelect(number);
      setShowNumberGrid(false);
    }, 500); // Wait for exit animation to complete
  };

  // Reset grid state when round changes or selection is cleared
  React.useEffect(() => {
    if (selectedNumber === null && !isEliminated) {
      setShowNumberGrid(true);
      setIsGridExiting(false);
    }
  }, [selectedNumber, currentRound, isEliminated]);
  return (
    <div className="space-y-6">
      {/* Elimination Message */}
      {isEliminated && (
        <div className="glass-card p-6 text-center bg-red-500/20 border-red-500/30">
          <h3 className="text-2xl font-bold text-red-300 mb-2">💀 YOU ARE ELIMINATED</h3>
          <p className="text-red-200">
            You reached -10 points and have been eliminated from the game.
          </p>
          <p className="text-red-200/70 text-sm mt-2">
            Continue watching the game unfold!
          </p>
        </div>
      )}

      {/* Round Info */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            Round {currentRound}
          </h3>
          {timeLeft !== null && (
            <div className={`text-2xl font-bold transition-all duration-300 ${
              timeLeft <= 10 
                ? 'text-red-400 animate-pulse' 
                : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        {!isEliminated && selectedNumber !== null ? (
          <div className="text-center">
            <p className="text-white/70 mb-2">You selected:</p>
            <div className="text-4xl font-bold text-diamond-400">
              {selectedNumber}
            </div>
            <div className="mt-3 text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-white/80 text-sm font-medium">
                  {chosenCount} / {totalActivePlayers} players have chosen
                </p>
              </div>
            </div>
          </div>
        ) : !isEliminated ? (
          <div>
            <p className="text-white/70 mb-4 text-center">
              Choose your number (0-100):
            </p>
            
            {showNumberGrid && (
              <NumberGrid 
                onNumberSelect={handleNumberSelect}
                isExiting={isGridExiting}
              />
            )}
            
            <ChoiceProgress 
              chosenCount={chosenCount}
              totalActivePlayers={totalActivePlayers}
              lastChoiceUpdate={lastChoiceUpdate}
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <p className="text-white/80 font-medium">
                {chosenCount} / {totalActivePlayers} active players have chosen
              </p>
            </div>
            <p className="text-white/60 text-sm">
              You've been eliminated - watch the final battle! 💀
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
