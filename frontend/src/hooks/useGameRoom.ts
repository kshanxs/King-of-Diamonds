import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import type { GameState, Player, RoundResult } from '../types/game';

export const useGameRoom = (roomId: string, playerId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [chosenCount, setChosenCount] = useState(0);
  const [totalActivePlayers, setTotalActivePlayers] = useState(0);
  const [lastChoiceUpdate, setLastChoiceUpdate] = useState<{playerType: string; timestamp: number} | null>(null);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [gameFinishedData, setGameFinishedData] = useState<{winner: string; finalScores: Player[]} | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const [totalReadyPlayers, setTotalReadyPlayers] = useState(0);
  const [leftPlayers, setLeftPlayers] = useState<Set<string>>(new Set());
  
  // Use ref to track previous chosenCount for vibration
  const prevChosenCountRef = useRef(0);

  useEffect(() => {
    socketService.connect();
    socketService.joinRoom(roomId, playerId);

    // Set up event listeners
    socketService.on('roomJoined', (data: GameState) => {
      setGameState(data);
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
      setReadyCount(0);
      setTotalReadyPlayers(0);
      setChosenCount(0);
      const activePlayers = data.players.filter((p: { isEliminated?: boolean }) => !p.isEliminated);
      setTotalActivePlayers(activePlayers.length);
    });

    socketService.on('nextRoundCountdown', (countdown: number) => {
      setNextRoundCountdown(countdown);
    });

    socketService.on('readyUpdate', (data) => {
      setReadyCount(data.readyCount);
      setTotalReadyPlayers(data.totalActive);
      
      if (data.allReady) {
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        setTimeout(() => {
          setNextRoundCountdown(0);
        }, 500);
      }
    });

    socketService.on('roundTimer', (timeLeft: number) => {
      setTimeLeft(timeLeft);
    });

    socketService.on('choiceUpdate', (data) => {
      console.log('📊 Choice update received:', data);
      setChosenCount(data.chosenCount);
      setTotalActivePlayers(data.totalActivePlayers);
      
      if (data.lastPlayerName && data.timestamp) {
        setLastChoiceUpdate({ 
          playerType: data.lastPlayerName, 
          timestamp: data.timestamp 
        });
        setTimeout(() => setLastChoiceUpdate(null), 3000);
      }
      
      // Add subtle haptic feedback on mobile for choice updates
      if ('vibrate' in navigator && data.chosenCount > prevChosenCountRef.current) {
        navigator.vibrate(50);
      }
      
      // Update the ref with current count
      prevChosenCountRef.current = data.chosenCount;
    });

    socketService.on('roundResult', (result: RoundResult) => {
      setLastRoundResult(result);
      setShowRoundResult(true);
      setGameState(prev => prev ? {
        ...prev,
        players: result.players,
        roundHistory: [...(prev.roundHistory || []), result]
      } : null);
      
      const currentPlayer = result.players.find(p => p.id === playerId);
      setIsEliminated(currentPlayer?.isEliminated || false);
      setTimeLeft(null);
    });

    socketService.on('gameFinished', (data) => {
      setGameState(prev => prev ? { ...prev, gameState: 'finished' } : null);
      setGameFinishedData(data);
    });

    socketService.on('error', (message: string) => {
      console.error('Socket error:', message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [roomId, playerId]); // Removed chosenCount from dependencies

  const handleStartGame = () => {
    socketService.startGame(roomId, playerId);
  };

  const handleNumberSelect = (number: number) => {
    if (gameState?.gameState === 'playing' && selectedNumber === null && !isEliminated) {
      setSelectedNumber(number);
      socketService.makeChoice(roomId, playerId, number);
    }
  };

  const handleContinueClick = () => {
    setHasClickedContinue(true);
    socketService.emit('playerReady', { roomId, playerId });
    
    // Close the modal immediately when continue is clicked
    if (gameState?.gameState === 'finished') {
      setShowRoundResult(false);
    } else {
      // For ongoing games, close the modal to avoid the red button flash
      setShowRoundResult(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
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
    hasClickedContinue,
    readyCount,
    totalReadyPlayers,
    leftPlayers,
    
    // Actions
    handleStartGame,
    handleNumberSelect,
    handleContinueClick,
    copyRoomCode,
    formatTime
  };
};
