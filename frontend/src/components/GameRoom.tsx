import React from 'react';
import { socketService } from '../services/socketService';
import { LoadingSpinner } from './LoadingSpinner';
import { GameFinished } from './GameFinished';
import { LiveLeaderboard } from './LiveLeaderboard';
import { ActiveRules } from './ActiveRules';
import { GameLobby } from './GameLobby';
import { GameCountdown } from './GameCountdown';
import { GamePlaying } from './GamePlaying';
import { RoundResultModal } from './RoundResultModal';
import { RoundHistory } from './RoundHistory';
import { useGameRoom } from '../hooks/useGameRoom';

interface GameRoomProps {
  roomId: string;
  playerId: string;
  onLeaveRoom: () => void;
}

export const GameRoom: React.FC<GameRoomProps> = ({ roomId, playerId, onLeaveRoom }) => {
  console.log('🎮 GameRoom rendering with:', { roomId, playerId });
  
  const {
    gameState,
    selectedNumber,
    countdown,
    timeLeft,
    chosenCount,
    totalActivePlayers,
    lastChoiceUpdate,
    lastRoundResult,
    showRoundResult,
    gameFinishedData,
    isEliminated,
    nextRoundCountdown,
    readyCount,
    totalReadyPlayers,
    leftPlayers,
    botAssignmentEnabled,
    isHost,
    handleStartGame,
    handleNumberSelect,
    handleContinueClick,
    handleToggleBotAssignment,
    formatTime
  } = useGameRoom(roomId, playerId);

  const handleLeaveRoom = () => {
    socketService.disconnect();
    onLeaveRoom();
  };

  if (!gameState) {
    console.log('⚠️ GameRoom: No gameState, showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <LoadingSpinner text="Connecting to game room..." />
          <div className="mt-4 text-center">
            <button 
              onClick={handleLeaveRoom}
              className="glass-button text-sm px-4 py-2 !bg-red-500/20 hover:!bg-red-500/30"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <LiveLeaderboard 
          players={gameState.players}
          playerId={playerId}
          leftPlayers={leftPlayers}
          roundHistory={gameState.roundHistory}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* Room Code Display - positioned below LiveLeaderboard */}
        {gameState.gameState !== 'waiting' && (
          <div className="text-center">
            <p className="text-white/40 text-xs">
              Room Code: <span className="font-mono text-white/60">{roomId}</span>
            </p>
          </div>
        )}

        {gameState.gameState === 'playing' && (
          <ActiveRules activeRules={gameState.activeRules} />
        )}

        {gameState.gameState === 'waiting' && (
          <GameLobby 
            playersCount={gameState.players.length}
            isHost={isHost}
            roomId={roomId}
            botAssignmentEnabled={botAssignmentEnabled}
            onStartGame={handleStartGame}
            onToggleBotAssignment={handleToggleBotAssignment}
          />
        )}

        {gameState.gameState === 'countdown' && countdown !== null && (
          <GameCountdown countdown={countdown} />
        )}

        {gameState.gameState === 'playing' && (
          <GamePlaying 
            currentRound={gameState.currentRound}
            timeLeft={timeLeft}
            isEliminated={isEliminated}
            selectedNumber={selectedNumber}
            chosenCount={chosenCount}
            totalActivePlayers={totalActivePlayers}
            lastChoiceUpdate={lastChoiceUpdate}
            onNumberSelect={handleNumberSelect}
            formatTime={formatTime}
          />
        )}

        {showRoundResult && lastRoundResult && (
          <RoundResultModal 
            lastRoundResult={lastRoundResult}
            nextRoundCountdown={nextRoundCountdown}
            readyCount={readyCount}
            totalReadyPlayers={totalReadyPlayers}
            gameState={gameState?.gameState}
            onContinueClick={handleContinueClick}
          />
        )}

        <RoundHistory roundHistory={gameState.roundHistory} />
        
        {gameFinishedData && !showRoundResult && (
          <GameFinished
            winner={gameFinishedData.winner}
            finalScores={gameFinishedData.finalScores}
            onNewGame={handleLeaveRoom}
            reason={gameFinishedData.reason}
          />
        )}
      </div>
    </div>
  );
};
