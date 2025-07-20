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
  const [gameFinishedData, setGameFinishedData] = useState<{winner: string; finalScores: Player[]; reason?: string} | null>(null);
  const [isEliminated, setIsEliminated] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const [totalReadyPlayers, setTotalReadyPlayers] = useState(0);
  const [leftPlayers, setLeftPlayers] = useState<Set<string>>(new Set());
  const [botAssignmentEnabled, setBotAssignmentEnabled] = useState(true);
  const [isHost, setIsHost] = useState(false);
  
  // Use ref to track current botAssignmentEnabled for event handlers
  const botAssignmentEnabledRef = useRef(botAssignmentEnabled);
  
  // Update ref whenever state changes
  useEffect(() => {
    botAssignmentEnabledRef.current = botAssignmentEnabled;
  }, [botAssignmentEnabled]);
  
  // Use ref to track previous chosenCount for vibration
  const prevChosenCountRef = useRef(0);

  useEffect(() => {
    console.log('🎮 useGameRoom: Initializing connection...');
    console.log('🎮 useGameRoom: Room ID:', roomId, 'Player ID:', playerId);
    
    socketService.connect();
    
    // Add connection state monitoring
    const connectionStateCheck = setInterval(() => {
      const state = socketService.getConnectionState();
      console.log('🔍 Connection state:', state);
    }, 2000);
    
    socketService.joinRoom(roomId, playerId);

    // Set up event listeners
    socketService.on('roomJoined', (data: GameState) => {
      console.log('✅ Room joined successfully:', data);
      console.log('🎮 Setting botAssignmentEnabled from roomJoined:', data.botAssignmentEnabled);
      setGameState(data);
      setBotAssignmentEnabled(data.botAssignmentEnabled ?? true);
      setIsHost(data.isHost ?? false);
      const currentPlayer = data.players.find(p => p.id === playerId);
      setIsEliminated(currentPlayer?.isEliminated || false);
    });

    // Bot assignment changed
    console.log('🎮 useGameRoom: Setting up botAssignmentChanged listener');
    socketService.on('botAssignmentChanged', (data: { enabled: boolean }) => {
      console.log('🎮 Bot assignment changed event received:', data);
      console.log('🎮 Current botAssignmentEnabled state before update:', botAssignmentEnabled);
      setBotAssignmentEnabled(data.enabled);
      console.log('🎮 setBotAssignmentEnabled called with:', data.enabled);
    });

    socketService.on('playerJoined', (data: { players: Player[] }) => {
      setGameState(prev => prev ? { ...prev, players: data.players } : null);
    });

    socketService.on('playerLeft', (data: { 
      players: Player[]; 
      leftPlayerId?: string; 
      leftPlayerName: string;
      assignedBotName?: string;
    }) => {
      if (data.leftPlayerId) {
        setLeftPlayers(prev => new Set([...prev, data.leftPlayerId!]));
        
        // Show notification about bot assignment if applicable
        if (data.assignedBotName) {
          console.log(`Player ${data.leftPlayerName} left. Bot "${data.assignedBotName}" assigned to take their place.`);
        }
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
      console.log('🏁 Game finished event received:', data);
      setGameState(prev => prev ? { ...prev, gameState: 'finished' } : null);
      setGameFinishedData(data);
    });

    socketService.on('error', (message: string) => {
      console.error('Socket error:', message);
      
      // If we get an error about invalid room or player, it means the stored data is stale
      if (message.includes('Invalid room or player')) {
        console.warn('⚠️ Stored room/player data appears to be invalid, should return to home');
        // Don't automatically redirect here, let the user click "Back to Home"
      }
    });

    return () => {
      clearInterval(connectionStateCheck);
      socketService.disconnect();
    };
  }, [roomId, playerId]); // Removed chosenCount from dependencies

  // Debug: Track botAssignmentEnabled state changes
  useEffect(() => {
    console.log(`🎮 botAssignmentEnabled state changed to: ${botAssignmentEnabled}`);
  }, [botAssignmentEnabled]);

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

  const handleToggleBotAssignment = (enabled: boolean) => {
    console.log(`🎮 useGameRoom.handleToggleBotAssignment called with enabled: ${enabled}`);
    console.log(`🎮 Current botAssignmentEnabled state: ${botAssignmentEnabled}`);
    console.log(`🎮 Current botAssignmentEnabledRef.current: ${botAssignmentEnabledRef.current}`);
    console.log(`🎮 Sending to socketService.toggleBotAssignment: roomId=${roomId}, playerId=${playerId}, enabled=${enabled}`);
    socketService.toggleBotAssignment(roomId, playerId, enabled);
  };

  // Temporary test function to manually update state
  const testStateUpdate = () => {
    console.log(`🧪 TEST: Manual state update from ${botAssignmentEnabled} to ${!botAssignmentEnabled}`);
    setBotAssignmentEnabled(!botAssignmentEnabled);
  };

  // Add test function to window for debugging
  useEffect(() => {
    (window as any).testStateUpdate = testStateUpdate;
    return () => {
      delete (window as any).testStateUpdate;
    };
  }, [botAssignmentEnabled]);

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
    botAssignmentEnabled,
    isHost,
    
    // Actions
    handleStartGame,
    handleNumberSelect,
    handleContinueClick,
    handleToggleBotAssignment,
    copyRoomCode,
    formatTime
  };
};
