import React from 'react';
import { socketService } from '../services/socketService';
import { LoadingSpinner } from './LoadingSpinner';
import { GameFinished } from './GameFinished';
import { GameHeader } from './GameHeader';
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
    handleStartGame,
    handleNumberSelect,
    handleContinueClick,
    copyRoomCode,
    formatTime
  } = useGameRoom(roomId, playerId);

  const handleLeaveRoom = () => {
    socketService.disconnect();
    onLeaveRoom();
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
        <GameHeader 
          roomId={roomId}
          currentRound={gameState.currentRound}
          onLeaveRoom={handleLeaveRoom}
          onCopyRoomCode={copyRoomCode}
        />

        <LiveLeaderboard 
          players={gameState.players}
          playerId={playerId}
          leftPlayers={leftPlayers}
          roundHistory={gameState.roundHistory}
        />

        {gameState.gameState === 'playing' && (
          <ActiveRules activeRules={gameState.activeRules} />
        )}

        {gameState.gameState === 'waiting' && (
          <GameLobby 
            playersCount={gameState.players.length}
            isHost={isHost}
            roomId={roomId}
            onStartGame={handleStartGame}
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
          />
        )}
      </div>
    </div>
  );
};
