import React, { memo } from 'react';

interface ChoiceProgressProps {
  chosenCount: number;
  totalActivePlayers: number;
  lastChoiceUpdate: {playerType: string; timestamp: number} | null;
}

export const ChoiceProgress: React.FC<ChoiceProgressProps> = memo(({
  chosenCount,
  totalActivePlayers,
  lastChoiceUpdate
}) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full">
        {chosenCount === totalActivePlayers && totalActivePlayers > 0 ? (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        ) : (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        )}
        <span className="text-white/80 font-medium">
          {chosenCount} / {totalActivePlayers} players have chosen
          {chosenCount === totalActivePlayers && totalActivePlayers > 0 && (
            <span className="text-green-400 ml-1">✓</span>
          )}
        </span>
        <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              chosenCount === totalActivePlayers && totalActivePlayers > 0
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse'
                : 'bg-gradient-to-r from-yellow-400 to-green-400'
            }`}
            style={{ width: `${totalActivePlayers > 0 ? (chosenCount / totalActivePlayers) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      {chosenCount === totalActivePlayers && totalActivePlayers > 0 && (
        <p className="text-green-400 text-xs mt-2 animate-bounce">
          All players ready! Processing round... 🎯
        </p>
      )}
      {lastChoiceUpdate && chosenCount < totalActivePlayers && (
        <p className="text-blue-300 text-xs mt-1 opacity-75">
          {lastChoiceUpdate.playerType} just chose! ⚡
        </p>
      )}
    </div>
  );
});
