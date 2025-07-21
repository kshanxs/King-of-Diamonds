import React, { memo } from 'react';
import { triggerHaptic } from '../utils/haptics';
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
  leftPlayers: _leftPlayers, // eslint-disable-line @typescript-eslint/no-unused-vars
  roundHistory = [], // Default to empty array
  onLeaveRoom
}) => {
  
  // Function to calculate net point changes for a specific player across all rounds
  const getPlayerPointHistory = (playerName: string): number[] => {
    // Gather the player's score at the end of each round
    const scores: number[] = [];
    roundHistory.forEach((round) => {
      const player = round.players?.find((p) => p.name === playerName);
      if (player) {
        scores.push(player.score);
      }
    });
    // Calculate the difference between each round (net change per round)
    const pointChanges: number[] = [];
    for (let i = 0; i < scores.length; i++) {
      if (i === 0) {
        pointChanges.push(scores[0]); // First round, show initial score (should be 0 or first gain/loss)
      } else {
        pointChanges.push(scores[i] - scores[i - 1]);
      }
    }
    // Always show 0 for rounds with no change
    return pointChanges.map(val => val === undefined ? 0 : val);
  };
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">🏆 Live Leaderboard</h3>
        {onLeaveRoom && (
          <button
            onClick={() => { triggerHaptic(); onLeaveRoom(); }}
            className="glass-button text-sm font-semibold flex items-center justify-center gap-2 !bg-red-500/20 hover:!bg-red-500/40 ml-2"
            title="Leave Room"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            <span>Leave</span>
          </button>
        )}
      </div>
      <div className="space-y-3">
        {players
          .sort((a, b) => {
            // Players with assigned bots should not be treated as "left"
            const aActuallyLeft = (a.hasLeft || false) && !a.assignedBotName;
            const bActuallyLeft = (b.hasLeft || false) && !b.assignedBotName;
            
            // First sort by actually left status (truly left players go to bottom)
            if (aActuallyLeft !== bActuallyLeft) {
              return aActuallyLeft ? 1 : -1;
            }
            // Then sort by elimination status (eliminated go to bottom among non-left)
            if (!aActuallyLeft && !bActuallyLeft && a.isEliminated !== b.isEliminated) {
              return a.isEliminated ? 1 : -1;
            }
            // Finally sort by score (highest first)
            return b.score - a.score;
          })
          .map((player) => {
            // Players with assigned bots should be treated as active even if hasLeft is true
            const hasLeft = player.hasLeft || false;
            const isActuallyLeft = hasLeft && !player.assignedBotName;
            
            // Calculate actual ranking for active players (including those with assigned bots)
            let actualRank = -1;
            if (!isActuallyLeft && !player.isEliminated) {
              const activePlayers = players.filter(p => (!p.hasLeft || p.assignedBotName) && !p.isEliminated);
              actualRank = activePlayers
                .sort((a, b) => b.score - a.score)
                .findIndex(p => p.id === player.id);
            }
            

            // Get player's point history (net change per round, including 0s)
            const pointHistory = getPlayerPointHistory(player.name);
            // Use backend score for display
            const displayScore = player.score;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isActuallyLeft
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
                      {isActuallyLeft ? '💀' : player.isEliminated ? '💀' : (
                        actualRank === 0 ? '🥇' : actualRank === 1 ? '🥈' : actualRank === 2 ? '🥉' : '⭐'
                      )}
                    </div>
                    
                    <div>
                      <p className={`font-semibold ${
                        isActuallyLeft ? 'text-gray-400' :
                        player.isEliminated ? 'text-red-300' : 
                        actualRank === 0 ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {/* Show original name if player left and bot was assigned */}
                        {player.originalName ? player.originalName : player.name}
                        {player.id === playerId && ' (You)'}
                        {isActuallyLeft && ' 👋'}
                        {player.isEliminated && ' 💀'}
                      </p>
                      
                      {/* Show assigned bot name if applicable */}
                      {player.assignedBotName && (
                        <p className="text-sm text-blue-300 mt-1">
                          🤖 Bot: {player.assignedBotName}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <p className={`text-sm ${
                          isActuallyLeft ? 'text-gray-500' :
                          player.isEliminated ? 'text-red-400' : 'text-white/70'
                        }`}>
                          Score: {displayScore}
                        </p>
                        {/* Point History Display */}
                        {pointHistory.length > 0 && (
                          <p className={`text-sm ${
                            isActuallyLeft ? 'text-gray-500' :
                            player.isEliminated ? 'text-red-400' : 'text-white/70'
                          }`}>
                            ({pointHistory.join(', ')})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Show status on right: LEFT or ELIMINATED */}
                  {isActuallyLeft && (
                    <span className="text-gray-400 font-bold text-sm">LEFT</span>
                  )}
                  {player.isEliminated && (
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
