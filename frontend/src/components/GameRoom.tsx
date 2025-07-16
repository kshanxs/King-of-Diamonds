import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { LoadingSpinner } from './LoadingSpinner';
import { GameFinished } from './GameFinished';
import type { GameState, Player, RoundResult } from '../types/game';

interface GameRoomProps {
  roomId: string;
  playerId: string;
  onLeaveRoom: () => void;
}

export const GameRoom: React.FC<GameRoomProps> = ({ roomId, playerId, onLeaveRoom }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [chosenCount, setChosenCount] = useState(0);
  const [totalActivePlayers, setTotalActivePlayers] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [gameFinishedData, setGameFinishedData] = useState<{winner: string; finalScores: Player[]} | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [leftPlayers, setLeftPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    socketService.connect();

    // Join the room
    socketService.joinRoom(roomId, playerId);

    // Set up event listeners
    socketService.on('roomJoined', (data: GameState) => {
      setGameState(data);
      // Check if current player is eliminated
      const currentPlayer = data.players.find(p => p.id === playerId);
      setIsEliminated(currentPlayer?.isEliminated || false);
    });

    socketService.on('playerJoined', (data: { players: Player[] }) => {
      setGameState(prev => prev ? { ...prev, players: data.players } : null);
    });

    socketService.on('playerLeft', (data: { players: Player[]; leftPlayerId?: string }) => {
      if (data.leftPlayerId) {
        setLeftPlayers(prev => new Set([...prev, data.leftPlayerId!]));
      }
      setGameState(prev => prev ? { ...prev, players: data.players } : null);
    });

    socketService.on('gameStarting', () => {
      setGameState(prev => prev ? { ...prev, gameState: 'countdown' } : null);
    });

    socketService.on('countdown', (count: number) => {
      setCountdown(count);
    });

    socketService.on('newRound', (data) => {
      setGameState(prev => prev ? {
        ...prev,
        currentRound: data.round,
        activeRules: data.activeRules,
        players: data.players,
        gameState: 'playing'
      } : null);
      setSelectedNumber(null);
      setCountdown(null);
      setShowRoundResult(false);
      setNextRoundCountdown(null);
      setHasClickedContinue(false);
    });

    socketService.on('nextRoundCountdown', (countdown: number) => {
      setNextRoundCountdown(countdown);
    });

    socketService.on('roundTimer', (timeLeft: number) => {
      setTimeLeft(timeLeft);
    });

    socketService.on('choiceUpdate', (data) => {
      setChosenCount(data.chosenCount);
      setTotalActivePlayers(data.totalActivePlayers);
    });

    socketService.on('roundResult', (result: RoundResult) => {
      setLastRoundResult(result);
      setShowRoundResult(true);
      setGameState(prev => prev ? {
        ...prev,
        players: result.players,
        roundHistory: [...(prev.roundHistory || []), result]
      } : null);
      
      // Check if current player is eliminated
      const currentPlayer = result.players.find(p => p.id === playerId);
      setIsEliminated(currentPlayer?.isEliminated || false);
      
      setTimeLeft(null);
    });

    socketService.on('gameFinished', (data) => {
      setGameState(prev => prev ? { ...prev, gameState: 'finished' } : null);
      setGameFinishedData(data);
      // Don't auto-dismiss round results when game finishes
      // Let the user manually close it
    });

    socketService.on('error', (message: string) => {
      console.error('Socket error:', message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [roomId, playerId]);

  const handleStartGame = () => {
    socketService.startGame(roomId, playerId);
  };

  const handleNumberSelect = (number: number) => {
    if (gameState?.gameState === 'playing' && selectedNumber === null && !isEliminated) {
      setSelectedNumber(number);
      socketService.makeChoice(roomId, playerId, number);
    }
  };

  const handleLeaveRoom = () => {
    socketService.disconnect();
    onLeaveRoom();
  };

  const handleContinueClick = () => {
    setHasClickedContinue(true);
    socketService.emit('playerReady', { roomId, playerId });
    
    // Only close the modal if game is finished - never auto-close for countdown
    if (gameState?.gameState === 'finished') {
      setShowRoundResult(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <LoadingSpinner text="Connecting to game room..." />
        </div>
      </div>
    );
  }

  const isHost = gameState.players[0]?.id === playerId;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-white">Room: {roomId}</h1>
                <button
                  onClick={copyRoomCode}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white hover:text-diamond-300"
                  title="Copy room code"
                >
                  📋
                </button>
              </div>
              <p className="text-white/70">Round {gameState.currentRound || 0}</p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="glass-button !bg-red-500/20 hover:!bg-red-500/30"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Real-time Leaderboard */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Live Leaderboard</h3>
          <div className="space-y-3">
            {gameState.players
              .sort((a, b) => b.score - a.score) // Sort by score (highest first)
              .map((player, index) => {
                const hasLeft = leftPlayers.has(player.id);
                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      hasLeft
                        ? 'bg-gray-500/10 border-gray-500/30 opacity-60'
                        : player.isEliminated
                        ? 'bg-red-500/10 border-red-500/30 opacity-75'
                        : index === 0
                        ? 'bg-yellow-500/20 border-yellow-500/40 shadow-lg'
                        : index === 1
                        ? 'bg-gray-300/20 border-gray-300/40'
                        : index === 2
                        ? 'bg-orange-500/20 border-orange-500/40'
                        : 'bg-white/5 border-white/20'
                    } ${player.id === playerId ? 'ring-2 ring-diamond-400' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {hasLeft ? '👋' : !player.isEliminated ? (
                            index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'
                          ) : '💀'}
                        </div>
                        <div>
                          <p className={`font-semibold ${
                            hasLeft ? 'text-gray-400' :
                            player.isEliminated ? 'text-red-300' : 
                            index === 0 ? 'text-yellow-300' : 'text-white'
                          }`}>
                            {player.name} {player.isBot && '🤖'}
                            {player.id === playerId && ' (You)'}
                            {hasLeft && ' (Left)'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm ${
                              hasLeft ? 'text-gray-500' :
                              player.isEliminated ? 'text-red-400' : 'text-white/70'
                            }`}>
                              Score: {player.score}
                            </p>
                            {!hasLeft && gameState.gameState === 'playing' && !player.isEliminated && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                player.hasChosenThisRound 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-orange-500/20 text-orange-300'
                              }`}>
                                {player.hasChosenThisRound ? '✓ Ready' : '⏳ Choosing'}
                              </span>
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

        {/* Active Rules */}
        {gameState.activeRules.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-3">📜 Active Rules:</h3>
            <div className="space-y-2">
              {gameState.activeRules.map((rule, index) => (
                <div key={index} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game State Display */}
        {gameState.gameState === 'waiting' && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Game Lobby</h2>
            <p className="text-white/70 mb-6">
              {gameState.players.length} / 5 players joined
            </p>
            {isHost && (
              <div className="space-y-4">
                {gameState.players.length === 1 ? (
                  <>
                    <button
                      onClick={handleStartGame}
                      className="glass-button text-xl px-8 py-4 !bg-diamond-500/20 hover:!bg-diamond-500/30"
                    >
                      Start Solo (With AI Opponents)
                    </button>
                    <p className="text-white/50 text-sm">
                      Play against 4 AI opponents for strategic solo gameplay
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartGame}
                      className="glass-button text-xl px-8 py-4"
                    >
                      Start Multiplayer Game
                    </button>
                    <p className="text-white/50 text-sm">
                      Playing with {gameState.players.length} human players
                      {gameState.players.length < 5 && ` + ${5 - gameState.players.length} AI opponents`}
                    </p>
                  </>
                )}
                <div className="text-xs text-white/40 mt-2">
                  Room Code: <span className="font-mono font-bold text-diamond-300">{roomId}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState.gameState === 'countdown' && countdown !== null && (
          <div className="glass-card p-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Game Starting...</h2>
            <div className="text-8xl font-bold text-diamond-400 animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {gameState.gameState === 'playing' && (
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
                  Round {gameState.currentRound}
                </h3>
                {timeLeft !== null && (
                  <div className="text-2xl font-bold text-white">
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
                  <p className="text-white/50 mt-2">
                    {chosenCount} / {totalActivePlayers} players have chosen
                  </p>
                </div>
              ) : !isEliminated ? (
                <div>
                  <p className="text-white/70 mb-4 text-center">
                    Choose your number (0-100):
                  </p>
                  
                  {/* Number Grid */}
                  <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                    {Array.from({ length: 101 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleNumberSelect(i)}
                        className="number-button aspect-square flex items-center justify-center"
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white/50">
                    {chosenCount} / {totalActivePlayers} active players have chosen
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Round Result Modal */}
        {showRoundResult && lastRoundResult && (
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
              
              {/* Next Round Timer */}
              {nextRoundCountdown !== null && nextRoundCountdown > 0 && (
                <div className="text-center py-2">
                  <p className="text-white/60 text-sm">Next round starts in:</p>
                  <p className="text-diamond-400 font-bold text-lg">{nextRoundCountdown}s</p>
                </div>
              )}
              
              <button
                onClick={handleContinueClick}
                className={`glass-button w-full mt-6 transition-all duration-300 ${
                  nextRoundCountdown !== null && nextRoundCountdown <= 0 && gameState?.gameState !== 'finished'
                    ? 'animate-pulse !bg-red-500/30 border-red-500/50' 
                    : ''
                }`}
              >
                {gameState?.gameState === 'finished' 
                  ? 'View Final Results' 
                  : nextRoundCountdown !== null && nextRoundCountdown <= 0
                  ? 'Round Started! Click to Continue'
                  : hasClickedContinue 
                  ? 'Waiting for others...'
                  : 'Continue'
                }
              </button>
            </div>
          </div>
        )}

        {/* Detailed Round History */}
        {gameState.roundHistory && gameState.roundHistory.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 Round History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {gameState.roundHistory.map((round) => (
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
        )}
        
        {/* Game Finished Modal - Only show when round result is dismissed */}
        {gameFinishedData && !showRoundResult && (
          <GameFinished
            winner={gameFinishedData.winner}
            finalScores={gameFinishedData.finalScores}
            onNewGame={handleLeaveRoom}
          />
        )}
      </div>
    </div>
  );
};
