export interface Player {
  id: string;
  name: string;
  score: number;
  isEliminated: boolean;
  isBot: boolean;
  hasLeft?: boolean;
  currentChoice?: number;
  hasChosenThisRound?: boolean;
}

export interface RoundResult {
  round: number;
  choices: { 
    name: string; 
    choice: number; 
    timedOut?: boolean;
    pointLosses?: { reason: string; points: number }[];
  }[];
  average: number;
  target: number;
  winner: string;
  timeoutPlayers?: string[];
  eliminatedThisRound: string[];
  players: Player[];
}

export interface GameState {
  roomId: string;
  players: Player[];
  gameState: 'waiting' | 'countdown' | 'playing' | 'finished';
  currentRound: number;
  activeRules: string[];
  roundHistory: RoundResult[];
  timeLeft?: number;
  chosenCount?: number;
  totalActivePlayers?: number;
}

export interface SocketEvents {
  roomJoined: (data: GameState) => void;
  playerJoined: (data: { players: Player[] }) => void;
  playerLeft: (data: { players: Player[] }) => void;
  gameStarting: () => void;
  countdown: (count: number) => void;
  newRound: (data: { round: number; activeRules: string[]; players: Player[] }) => void;
  roundTimer: (timeLeft: number) => void;
  nextRoundCountdown: (countdown: number) => void;
  readyUpdate: (data: { readyCount: number; totalActive: number; allReady: boolean }) => void;
  choiceConfirmed: (choice: number) => void;
  choiceUpdate: (data: { 
    chosenCount: number; 
    totalActivePlayers: number; 
    lastPlayerName?: string; 
    timestamp?: number; 
  }) => void;
  roundResult: (result: RoundResult) => void;
  gameFinished: (data: { winner: string; finalScores: Player[] }) => void;
  error: (message: string) => void;
}
