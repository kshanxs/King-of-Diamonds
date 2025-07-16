const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Game state storage
const rooms = new Map();
const playerSockets = new Map();

// Bot names for AI players
const BOT_NAMES = [
  'King of Hearts', 'Queen of Diamonds', 'King of Spades', 'Queen of Clubs',
  'King of Diamonds', 'Queen of Hearts', 'King of Clubs', 'Queen of Spades',
  'Jack of Hearts', 'Jack of Diamonds', 'Jack of Spades', 'Jack of Clubs',
  'Ace of Hearts', 'Ace of Diamonds', 'Ace of Spades', 'Ace of Clubs'
];

class GameRoom {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, countdown, playing, finished
    this.currentRound = 0;
    this.roundTimer = null;
    this.countdownTimer = null;
    this.roundHistory = [];
    this.eliminatedCount = 0;
    this.maxPlayers = 5;
    this.minPlayers = 1; // Allow single player with bots
    this.roundTimeLimit = 60; // seconds
    this.nextRoundTimer = null;
    this.playersReady = new Set();
    this.nextRoundDelay = 10; // seconds
  }

  addPlayer(playerId, playerName, isBot = false) {
    if (this.players.size >= this.maxPlayers) return false;
    
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      isEliminated: false,
      isBot: isBot,
      currentChoice: null,
      hasChosenThisRound: false
    };
    
    this.players.set(playerId, player);
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    if (this.players.size === 0) {
      return true; // Room should be deleted
    }
    return false;
  }

  fillWithBots() {
    const currentPlayerCount = this.players.size;
    const botsNeeded = Math.max(0, 5 - currentPlayerCount);
    
    // Create a shuffled copy of bot names to ensure no duplicates
    const availableBotNames = [...BOT_NAMES];
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = availableBotNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableBotNames[i], availableBotNames[j]] = [availableBotNames[j], availableBotNames[i]];
    }
    
    for (let i = 0; i < botsNeeded; i++) {
      const botId = uuidv4();
      const botName = availableBotNames[i]; // Take from shuffled array
      this.addPlayer(botId, botName, true);
    }
  }

  getActiveRules() {
    const rules = [];
    rules.push("No input within time limit → Lose 2 points");
    if (this.eliminatedCount >= 1) {
      rules.push("Duplicate numbers → All choosing them lose 1 point");
    }
    if (this.eliminatedCount >= 2) {
      rules.push("Exact correct number → Other players lose 2 points");
    }
    if (this.eliminatedCount >= 3) {
      rules.push("If one player chooses 0, another can win by choosing 100");
    }
    return rules;
  }

  startGame() {
    if (this.players.size < this.minPlayers) return false;
    
    // Always fill with bots to have 5 players total
    this.fillWithBots();
    
    this.gameState = 'countdown';
    this.startCountdown();
    return true;
  }

  startCountdown() {
    let countdown = 3;
    this.countdownTimer = setInterval(() => {
      io.to(this.roomId).emit('countdown', countdown);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(this.countdownTimer);
        this.gameState = 'playing';
        this.startNewRound();
      }
    }, 1000);
  }

  startNewRound() {
    this.currentRound++;
    
    // Clear any existing next round timer
    if (this.nextRoundTimer) {
      clearInterval(this.nextRoundTimer);
      this.nextRoundTimer = null;
    }
    
    // Reset player choices and ready states
    this.players.forEach(player => {
      player.currentChoice = null;
      player.hasChosenThisRound = false;
    });
    this.playersReady.clear();

    // Start round timer
    let timeLeft = this.roundTimeLimit;
    this.roundTimer = setInterval(() => {
      io.to(this.roomId).emit('roundTimer', timeLeft);
      timeLeft--;
      
      if (timeLeft < 0) {
        clearInterval(this.roundTimer);
        this.processRound();
      }
    }, 1000);

    // Make bot choices with staggered delays
    setTimeout(() => this.makeBotChoices(), 2000);

    io.to(this.roomId).emit('newRound', {
      round: this.currentRound,
      activeRules: this.getActiveRules(),
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot
      }))
    });
  }

  makeBotChoices() {
    const bots = Array.from(this.players.values()).filter(player => player.isBot && !player.isEliminated);
    
    bots.forEach((player, index) => {
      // Stagger bot choices with random delays between 3-15 seconds
      const delay = Math.random() * 12000 + 3000; // 3-15 seconds
      
      setTimeout(() => {
        if (this.gameState === 'playing' && !player.hasChosenThisRound && !player.isEliminated) {
          const choice = this.calculateBotChoice(player);
          this.makeChoice(player.id, choice);
        }
      }, delay);
    });
  }

  calculateBotChoice(bot) {
    const activeRules = this.getActiveRules();
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    const remainingPlayers = activePlayers.length;
    
    // Analyze bot personality based on card type
    const botPersonality = this.getBotPersonality(bot.name);
    
    // Early game strategy (first few rounds or many players)
    if (this.currentRound <= 2 || remainingPlayers >= 4) {
      return this.earlyGameStrategy(bot, botPersonality, activeRules);
    }
    
    // Mid game strategy (3 players left)
    if (remainingPlayers === 3) {
      return this.midGameStrategy(bot, botPersonality, activeRules);
    }
    
    // End game strategy (2 players left)
    if (remainingPlayers === 2) {
      return this.endGameStrategy(bot, botPersonality, activeRules);
    }
    
    // Fallback to conservative strategy
    return this.conservativeChoice();
  }

  getBotPersonality(botName) {
    if (botName.includes('King')) {
      return { type: 'aggressive', riskTolerance: 0.8, calculationFocus: 0.6 };
    } else if (botName.includes('Queen')) {
      return { type: 'balanced', riskTolerance: 0.5, calculationFocus: 0.8 };
    } else if (botName.includes('Jack')) {
      return { type: 'unpredictable', riskTolerance: 0.7, calculationFocus: 0.4 };
    } else if (botName.includes('Ace')) {
      return { type: 'mathematical', riskTolerance: 0.3, calculationFocus: 0.9 };
    }
    return { type: 'balanced', riskTolerance: 0.5, calculationFocus: 0.6 };
  }

  earlyGameStrategy(bot, personality, activeRules) {
    const historyData = this.analyzeRoundHistory();
    
    // Rule 1: Avoid duplicates if active
    const duplicateRuleActive = this.eliminatedCount >= 1;
    
    if (this.currentRound === 1) {
      // First round conservative approach
      const baseChoice = personality.type === 'aggressive' ? 45 : 
                        personality.type === 'mathematical' ? 40 :
                        personality.type === 'unpredictable' ? Math.floor(Math.random() * 60) + 20 : 42;
      
      const variation = Math.floor(Math.random() * 10) - 5;
      return Math.max(20, Math.min(70, Math.floor(baseChoice + variation)));
    }
    
    // Use historical data to predict target
    let predictedTarget = historyData.averageTarget || 40;
    
    // Adjust for duplicate rule
    if (duplicateRuleActive) {
      const avoidNumbers = this.getCommonNumbers(historyData);
      let choice = Math.floor(predictedTarget + (Math.floor(Math.random() * 20) - 10));
      
      // Avoid common numbers
      while (avoidNumbers.includes(choice) && Math.random() < 0.7) {
        choice = Math.floor(predictedTarget + (Math.floor(Math.random() * 20) - 10));
      }
      
      return Math.max(0, Math.min(100, choice));
    }
    
    // Normal strategy - aim slightly off target
    const targetAdjustment = personality.riskTolerance * (Math.floor(Math.random() * 16) - 8);
    return Math.max(0, Math.min(100, Math.floor(predictedTarget + targetAdjustment)));
  }

  midGameStrategy(bot, personality, activeRules) {
    const historyData = this.analyzeRoundHistory();
    const duplicateRuleActive = this.eliminatedCount >= 1;
    const perfectTargetRuleActive = this.eliminatedCount >= 2;
    
    // Calculate expected target based on remaining players
    const predictedTarget = this.predictTargetForRemainingPlayers();
    
    // Perfect target consideration
    if (perfectTargetRuleActive && personality.calculationFocus > 0.7 && Math.random() < 0.3) {
      // Attempt perfect target (high risk, high reward)
      return Math.floor(predictedTarget);
    }
    
    // Duplicate avoidance strategy
    if (duplicateRuleActive) {
      const avoidNumbers = this.getCommonNumbers(historyData);
      const riskNumbers = this.getRoundNumbers(); // 10, 20, 30, etc.
      
      let choice = Math.floor(predictedTarget + (Math.floor(Math.random() * 12) - 6));
      
      // Avoid risky numbers
      let attempts = 0;
      while ((avoidNumbers.includes(choice) || riskNumbers.includes(choice)) && attempts < 10) {
        choice = Math.floor(predictedTarget + (Math.floor(Math.random() * 20) - 10));
        attempts++;
      }
      
      return Math.max(0, Math.min(100, choice));
    }
    
    // Standard mid-game approach
    const adjustment = personality.riskTolerance * (Math.floor(Math.random() * 12) - 6);
    return Math.max(0, Math.min(100, Math.floor(predictedTarget + adjustment)));
  }

  endGameStrategy(bot, personality, activeRules) {
    const zeroHundredRuleActive = this.eliminatedCount >= 3;
    const duplicateRuleActive = this.eliminatedCount >= 1;
    const perfectTargetRuleActive = this.eliminatedCount >= 2;
    
    // Zero-hundred gambit consideration
    if (zeroHundredRuleActive) {
      // Analyze opponent's likely strategy
      const opponentBot = Array.from(this.players.values()).find(p => !p.isEliminated && p.id !== bot.id);
      
      if (personality.type === 'aggressive' && Math.random() < 0.4) {
        // Aggressive bots might try the zero gambit
        return 0;
      }
      
      if (personality.type === 'mathematical' && Math.random() < 0.3) {
        // Mathematical bots might counter with 100 if they expect opponent to choose 0
        return 100;
      }
      
      if (personality.type === 'unpredictable' && Math.random() < 0.5) {
        // Unpredictable bots might do either
        return Math.random() < 0.5 ? 0 : 100;
      }
    }
    
    // If not using zero-hundred gambit, play mathematical game
    const predictedTarget = this.predictTargetForTwoPlayers();
    
    // Perfect target attempt
    if (perfectTargetRuleActive && personality.calculationFocus > 0.8 && Math.random() < 0.4) {
      return Math.floor(predictedTarget);
    }
    
    // Avoid duplicates and play close to target
    const baseChoice = Math.floor(predictedTarget + (Math.floor(Math.random() * 8) - 4));
    
    // Avoid round numbers if duplicate rule active
    if (duplicateRuleActive && this.getRoundNumbers().includes(baseChoice) && Math.random() < 0.8) {
      return Math.floor(baseChoice + (Math.random() < 0.5 ? 3 : -3));
    }
    
    return Math.max(0, Math.min(100, baseChoice));
  }

  analyzeRoundHistory() {
    if (this.roundHistory.length === 0) {
      return { averageTarget: 40, commonNumbers: [], recentTargets: [] };
    }
    
    const recentRounds = this.roundHistory.slice(-3); // Last 3 rounds
    const targets = recentRounds.map(r => r.target).filter(t => t > 0);
    const averageTarget = targets.length > 0 ? Math.floor(targets.reduce((a, b) => a + b) / targets.length) : 40;
    
    // Find commonly chosen numbers
    const allChoices = [];
    recentRounds.forEach(round => {
      round.choices.forEach(choice => {
        if (choice.choice !== null && !choice.timedOut) {
          allChoices.push(choice.choice);
        }
      });
    });
    
    const choiceCounts = {};
    allChoices.forEach(choice => {
      choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
    });
    
    const commonNumbers = Object.keys(choiceCounts)
      .filter(num => choiceCounts[num] > 1)
      .map(num => parseInt(num));
    
    return { averageTarget, commonNumbers, recentTargets: targets };
  }

  getCommonNumbers(historyData) {
    return [...historyData.commonNumbers, ...this.getRoundNumbers()];
  }

  getRoundNumbers() {
    return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  }

  predictTargetForRemainingPlayers() {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    const playerCount = activePlayers.length;
    
    // Analyze recent patterns
    const historyData = this.analyzeRoundHistory();
    
    if (historyData.recentTargets.length > 0) {
      const recentAvg = historyData.recentTargets.reduce((a, b) => a + b) / historyData.recentTargets.length;
      // With fewer players, target tends to be more predictable
      return Math.floor(recentAvg + (Math.floor(Math.random() * 10) - 5));
    }
    
    // Default prediction based on player count
    if (playerCount <= 2) return 35;
    if (playerCount === 3) return 38;
    return 40;
  }

  predictTargetForTwoPlayers() {
    const historyData = this.analyzeRoundHistory();
    
    if (historyData.recentTargets.length > 0) {
      const trend = historyData.recentTargets[historyData.recentTargets.length - 1];
      // In 2-player games, targets can be more extreme
      return Math.floor(trend + (Math.floor(Math.random() * 12) - 6));
    }
    
    return Math.floor(35 + (Math.floor(Math.random() * 10) - 5));
  }

  conservativeChoice() {
    return Math.floor(Math.random() * 21) + 35; // 35-55 range
  }

  makeChoice(playerId, choice) {
    const player = this.players.get(playerId);
    if (!player || player.isEliminated || player.hasChosenThisRound) return false;
    
    player.currentChoice = choice;
    player.hasChosenThisRound = true;
    
    // Check if all non-eliminated players have chosen
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    const allChosen = activePlayers.every(p => p.hasChosenThisRound);
    
    if (allChosen) {
      clearInterval(this.roundTimer);
      this.processRound();
    }
    
    return true;
  }

  processRound() {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    
    // Apply timeout penalty (-2 points) for players who didn't choose
    const timeoutPlayers = [];
    activePlayers.forEach(player => {
      if (!player.hasChosenThisRound) {
        player.score -= 2;
        timeoutPlayers.push(player.name);
        player.currentChoice = null; // Set to null for display purposes
      }
    });
    
    // Get only players who made choices for target calculation
    const playersWithChoices = activePlayers.filter(p => p.hasChosenThisRound);
    const choices = playersWithChoices.map(p => p.currentChoice);
    
    if (choices.length === 0) {
      // No one made a choice, just apply timeout penalties and continue
      this.recordTimeoutRound(timeoutPlayers);
      return;
    }
    
    const average = choices.reduce((sum, choice) => sum + choice, 0) / choices.length;
    const target = average * 0.8;
    
    // Find closest to target (only among players who made choices)
    let winner = null;
    let minDistance = Infinity;
    
    playersWithChoices.forEach(player => {
      const distance = Math.abs(player.currentChoice - target);
      if (distance < minDistance) {
        minDistance = distance;
        winner = player;
      }
    });

    // Apply rules only to players who made choices
    const activeRules = this.getActiveRules();
    
    // Rule: Duplicate numbers (skip first rule which is timeout)
    if (activeRules.length >= 2) {
      const choiceCounts = {};
      playersWithChoices.forEach(player => {
        const choice = player.currentChoice;
        choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
      });
      
      playersWithChoices.forEach(player => {
        if (choiceCounts[player.currentChoice] > 1) {
          player.score -= 1;
        }
      });
    }
    
    // Rule: Exact correct number
    if (activeRules.length >= 3) {
      const exactMatch = playersWithChoices.find(p => p.currentChoice === Math.round(target));
      if (exactMatch) {
        playersWithChoices.forEach(player => {
          if (player.id !== exactMatch.id) {
            player.score -= 2;
          }
        });
      }
    }
    
    // Rule: 0 and 100 rule
    if (activeRules.length >= 4) {
      const zeroPlayer = playersWithChoices.find(p => p.currentChoice === 0);
      const hundredPlayer = playersWithChoices.find(p => p.currentChoice === 100);
      
      if (zeroPlayer && hundredPlayer) {
        // Hundred player wins this rule
        winner = hundredPlayer;
      }
    }
    
    // Apply losing points to non-winners who made choices
    if (winner) {
      playersWithChoices.forEach(player => {
        if (player.id !== winner.id) {
          player.score -= 1;
        }
      });
    }
    
    // Check for eliminations
    this.players.forEach(player => {
      if (player.score <= -10 && !player.isEliminated) {
        player.isEliminated = true;
        this.eliminatedCount++;
      }
    });
    
    // Record round history
    const roundResult = {
      round: this.currentRound,
      choices: activePlayers.map(p => ({ 
        name: p.name, 
        choice: p.currentChoice,
        timedOut: !p.hasChosenThisRound
      })),
      average: playersWithChoices.length > 0 ? average : 0,
      target: playersWithChoices.length > 0 ? target : 0,
      winner: winner ? winner.name : 'No winner',
      timeoutPlayers,
      eliminatedThisRound: Array.from(this.players.values())
        .filter(p => p.isEliminated && p.score === -10)
        .map(p => p.name)
    };
    
    this.roundHistory.push(roundResult);
    
    // Check game end condition
    const remainingPlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    
    if (remainingPlayers.length <= 1) {
      this.gameState = 'finished';
      io.to(this.roomId).emit('gameFinished', {
        winner: remainingPlayers[0]?.name || 'No winner',
        finalScores: Array.from(this.players.values())
      });
    } else {
      // Start next round countdown instead of immediate delay
      this.startNextRoundCountdown();
    }
    
    // Emit round results
    io.to(this.roomId).emit('roundResult', {
      ...roundResult,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot,
        currentChoice: p.currentChoice
      }))
    });
  }

  recordTimeoutRound(timeoutPlayers) {
    // Check for eliminations
    this.players.forEach(player => {
      if (player.score <= -10 && !player.isEliminated) {
        player.isEliminated = true;
        this.eliminatedCount++;
      }
    });

    // Record round with no choices made
    const roundResult = {
      round: this.currentRound,
      choices: [],
      average: 0,
      target: 0,
      winner: 'No winner - All players timed out',
      timeoutPlayers,
      eliminatedThisRound: Array.from(this.players.values())
        .filter(p => p.isEliminated && p.score <= -10)
        .map(p => p.name)
    };

    this.roundHistory.push(roundResult);

    // Check game end condition
    const remainingPlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    
    if (remainingPlayers.length <= 1) {
      this.gameState = 'finished';
      io.to(this.roomId).emit('gameFinished', {
        winner: remainingPlayers[0]?.name || 'No winner',
        finalScores: Array.from(this.players.values())
      });
    } else {
      // Start next round countdown instead of immediate delay  
      this.startNextRoundCountdown();
    }
    
    // Emit round results
    io.to(this.roomId).emit('roundResult', {
      ...roundResult,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot,
        currentChoice: p.currentChoice
      }))
    });
  }

  startNextRoundCountdown() {
    this.playersReady.clear(); // Reset ready states
    let countdown = this.nextRoundDelay;
    
    // Emit initial countdown
    io.to(this.roomId).emit('nextRoundCountdown', countdown);
    
    this.nextRoundTimer = setInterval(() => {
      countdown--;
      io.to(this.roomId).emit('nextRoundCountdown', countdown);
      
      if (countdown <= 0) {
        clearInterval(this.nextRoundTimer);
        this.startNewRound();
      }
    }, 1000);
  }

  playerReady(playerId) {
    this.playersReady.add(playerId);
    
    // Check if all non-eliminated players are ready
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    const allReady = activePlayers.every(p => this.playersReady.has(p.id));
    
    if (allReady && this.nextRoundTimer) {
      clearInterval(this.nextRoundTimer);
      this.startNewRound();
    }
  }
}

// API Routes
app.post('/api/create-room', (req, res) => {
  const { playerName } = req.body;
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const playerId = uuidv4();
  
  const room = new GameRoom(roomId, playerId);
  room.addPlayer(playerId, playerName);
  rooms.set(roomId, room);
  
  res.json({ roomId, playerId });
});

app.post('/api/join-room', (req, res) => {
  const { roomId, playerName } = req.body;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  if (room.gameState !== 'waiting') {
    return res.status(400).json({ error: 'Game already in progress' });
  }
  
  const playerId = uuidv4();
  const success = room.addPlayer(playerId, playerName);
  
  if (!success) {
    return res.status(400).json({ error: 'Room is full' });
  }
  
  res.json({ playerId });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.players.has(playerId)) {
      socket.emit('error', 'Invalid room or player');
      return;
    }

    socket.join(roomId);
    playerSockets.set(playerId, socket.id);
    
    // Send current room state
    socket.emit('roomJoined', {
      roomId,
      players: Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot
      })),
      gameState: room.gameState,
      currentRound: room.currentRound,
      activeRules: room.getActiveRules(),
      roundHistory: room.roundHistory
    });
    
    // Notify other players
    socket.to(roomId).emit('playerJoined', {
      players: Array.from(room.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot
      }))
    });
  });

  socket.on('startGame', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== playerId) {
      socket.emit('error', 'Not authorized to start game');
      return;
    }

    // Fill with bots if needed
    room.fillWithBots();
    
    const success = room.startGame();
    if (success) {
      io.to(roomId).emit('gameStarting');
    } else {
      socket.emit('error', 'Cannot start game');
    }
  });

  socket.on('makeChoice', ({ roomId, playerId, choice }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const success = room.makeChoice(playerId, choice);
    if (success) {
      socket.emit('choiceConfirmed', choice);
      
      // Notify that a player has made their choice (without revealing it)
      const activePlayers = Array.from(room.players.values()).filter(p => !p.isEliminated);
      const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
      
      io.to(roomId).emit('choiceUpdate', {
        chosenCount,
        totalActivePlayers: activePlayers.length
      });
    }
  });

  socket.on('playerReady', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    room.playerReady(playerId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove player from rooms
    for (const [playerId, socketId] of playerSockets.entries()) {
      if (socketId === socket.id) {
        playerSockets.delete(playerId);
        
        for (const [roomId, room] of rooms.entries()) {
          if (room.players.has(playerId) && !room.players.get(playerId).isBot) {
            const shouldDeleteRoom = room.removePlayer(playerId);
            
            if (shouldDeleteRoom) {
              rooms.delete(roomId);
            } else {
              // Notify other players
              io.to(roomId).emit('playerLeft', {
                leftPlayerId: disconnectedPlayer.id,
                players: Array.from(room.players.values()).map(p => ({
                  id: p.id,
                  name: p.name,
                  score: p.score,
                  isEliminated: p.isEliminated,
                  isBot: p.isBot
                }))
              });
            }
            break;
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
