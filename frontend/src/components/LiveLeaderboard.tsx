import React, { memo } from 'react';
import type { Player, RoundResult } from '../types/game';

interface LiveLeaderboardProps {
  players: Player[];
  playerId: string;
  leftPlayers?: Set<string>; // Made optional since we now use hasLeft from backend
  roundHistory?: RoundResult[]; // Add round history to track point changes
  onLeaveRoom?: () => void; // Add optional leave room handler
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = memo(({
  players,
  playerId,
  leftPlayers: _leftPlayers, // Keep for compatibility but don't use for display
  roundHistory = [], // Default to empty array
  onLeaveRoom
}) => {
  
  // Function to calculate point changes for a specific player across all rounds
  const getPlayerPointHistory = (playerName: string): number[] => {
    const pointChanges: number[] = [];
    
    roundHistory.forEach(round => {
      const playerChoice = round.choices.find(choice => choice.name === playerName);
      if (playerChoice) {
        // Calculate total loss for this round
        const totalLoss = playerChoice.pointLosses 
          ? playerChoice.pointLosses.reduce((sum, loss) => sum + loss.points, 0)
          : 0;
        
        // Add the loss (negative) or 0 if no points lost
        pointChanges.push(totalLoss > 0 ? -totalLoss : 0);
      }
    });
    
    return pointChanges;
  };
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">🏆 Live Leaderboard</h3>
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            className="glass-button px-4 py-2 !bg-red-500/20 hover:!bg-red-500/30 text-sm"
          >
            Leave Room
          </button>
        )}
      </div>
      <div className="space-y-3">
        {players
          .sort((a, b) => {
            // First sort by left status (left players go to bottom)
            // Only consider hasLeft from backend, not leftPlayers Set
            const aLeft = a.hasLeft || false;
            const bLeft = b.hasLeft || false;
            if (aLeft !== bLeft) {
              return aLeft ? 1 : -1;
            }
            // Then sort by elimination status (eliminated go to bottom among non-left)
            if (!aLeft && !bLeft && a.isEliminated !== b.isEliminated) {
              return a.isEliminated ? 1 : -1;
            }
            // Finally sort by score (highest first)
            return b.score - a.score;
          })
          .map((player) => {
            // Only use hasLeft from backend - this ensures we only show
            // players who left after the game started
            const hasLeft = player.hasLeft || false;
            // Calculate actual ranking only for non-left, non-eliminated players
            let actualRank = -1;
            if (!hasLeft && !player.isEliminated) {
              const activePlayers = players.filter(p => !p.hasLeft && !p.isEliminated);
              actualRank = activePlayers
                .sort((a, b) => b.score - a.score)
                .findIndex(p => p.id === player.id);
            }
            
            // Get player's point history
            const pointHistory = getPlayerPointHistory(player.name);
            
            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  hasLeft
                    ? 'bg-gray-500/10 border-gray-500/30 opacity-60'
                    : player.isEliminated
                    ? 'bg-red-500/10 border-red-500/30 opacity-75'
                    : actualRank === 0
                    ? 'bg-yellow-500/20 border-yellow-500/40 shadow-lg'
                    : actualRank === 1
                    ? 'bg-gray-300/20 border-gray-300/40'
                    : actualRank === 2
                    ? 'bg-orange-500/20 border-orange-500/40'
                    : 'bg-white/5 border-white/20'
                } ${player.id === playerId ? 'ring-2 ring-diamond-400' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {hasLeft ? '💀' : player.isEliminated ? '💀' : (
                        actualRank === 0 ? '🥇' : actualRank === 1 ? '🥈' : actualRank === 2 ? '🥉' : '⭐'
                      )}
                    </div>
                    
                    <div>
                      <p className={`font-semibold ${
                        hasLeft ? 'text-gray-400' :
                        player.isEliminated ? 'text-red-300' : 
                        actualRank === 0 ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {player.name} {player.isBot && '🤖'}
                        {player.id === playerId && ' (You)'}
                        {hasLeft && ' 👋 (Left)'}
                      </p>
                      <div className="flex items-center space-x-4">
                        <p className={`text-sm ${
                          hasLeft ? 'text-gray-500' :
                          player.isEliminated ? 'text-red-400' : 'text-white/70'
                        }`}>
                          Score: {player.score}
                        </p>
                        {/* Point History Display */}
                        {pointHistory.length > 0 && (
                          <p className={`text-sm ${
                            hasLeft ? 'text-gray-500' :
                            player.isEliminated ? 'text-red-400' : 'text-white/70'
                          }`}>
                            ({pointHistory.join(', ')})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {hasLeft ? (
                    <span className="text-gray-400 font-bold text-sm">LEFT</span>
                  ) : player.isEliminated && (
                    <span className="text-red-400 font-bold text-sm">ELIMINATED</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
});
