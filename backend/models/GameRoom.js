// 🏠 King of Diamonds - Game Room Model 💎

const { v4: uuidv4 } = require('uuid');
const { BOT_NAMES, GAME_CONFIG, RULE_THRESHOLDS } = require('../config/constants');
const BotAI = require('../services/BotAI');

class GameRoom {
  constructor(roomId, hostId, io) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.io = io; // Socket.io instance for emitting events
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, countdown, playing, finished
    this.currentRound = 0;
    this.roundTimer = null;
    this.countdownTimer = null;
    this.roundHistory = [];
    this.eliminatedCount = 0;
    this.maxPlayers = GAME_CONFIG.MAX_PLAYERS;
    this.minPlayers = GAME_CONFIG.MIN_PLAYERS;
    this.roundTimeLimit = GAME_CONFIG.ROUND_TIME_LIMIT;
    this.nextRoundTimer = null;
    this.playersReady = new Set();
    this.nextRoundDelay = GAME_CONFIG.NEXT_ROUND_DELAY;
    
    // Bot assignment settings (admin toggleable)
    this.botAssignmentEnabled = true; // Default: enabled
    
    // Initialize Bot AI service
    this.botAI = new BotAI();
  }

  /**
   * Add a player to the room
   * @param {string} playerId - Player ID
   * @param {string} playerName - Player name
   * @param {boolean} isBot - Whether the player is a bot
   * @returns {boolean} Success status
   */
  addPlayer(playerId, playerName, isBot = false) {
    // Count only non-left players for room capacity
    const activePlayerCount = Array.from(this.players.values()).filter(p => !p.hasLeft).length;
    if (activePlayerCount >= this.maxPlayers) return false;
    
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      isEliminated: false,
      isBot: isBot,
      hasLeft: false,
      currentChoice: null,
      hasChosenThisRound: false,
      timeoutCount: 0,  // Track consecutive timeouts for elimination rule
      originalName: null, // For tracking original human player name
      assignedBotName: null // Bot name assigned to replace left human player
    };
    
    this.players.set(playerId, player);
    return true;
  }

  /**
   * Toggle bot assignment setting (admin only)
   * @param {boolean} enabled - Whether to enable bot assignment
   */
  setBotAssignmentEnabled(enabled) {
    this.botAssignmentEnabled = enabled;
    console.log(`🎮 Bot assignment ${enabled ? 'enabled' : 'disabled'} in room ${this.roomId}`);
  }

  /**
   * Assign a bot to take over for a left human player
   * @param {Object} player - The left player object
   */
  assignBotToLeftPlayer(player) {
    // Get available bot names (not already used by other players)
    const usedBotNames = Array.from(this.players.values())
      .filter(p => p.isBot || p.assignedBotName)
      .map(p => p.assignedBotName || p.name);
    
    const availableBotNames = BOT_NAMES.filter(name => !usedBotNames.includes(name));
    
    if (availableBotNames.length === 0) {
      // Fallback to a default bot name with random suffix
      player.assignedBotName = `Bot ${Math.floor(Math.random() * 1000)}`;
    } else {
      // Assign a random available bot name
      const randomIndex = Math.floor(Math.random() * availableBotNames.length);
      player.assignedBotName = availableBotNames[randomIndex];
    }
    
    // Store original name if not already stored
    if (!player.originalName) {
      player.originalName = player.name;
    }
    
    // Store whether player had already made a choice this round
    const hadAlreadyChosen = player.hasChosenThisRound;
    
    // Convert player to bot behavior but keep hasLeft = true for display
    player.isBot = true;
    
    // Only reset choice status if they hadn't chosen yet
    if (!hadAlreadyChosen) {
      player.hasChosenThisRound = false;
    }
    
    console.log(`🤖 Assigned bot "${player.assignedBotName}" to take over for left player "${player.originalName}" in room ${this.roomId} (had chosen: ${hadAlreadyChosen})`);
    
    // If they had already chosen, log the choice details
    if (hadAlreadyChosen) {
      console.log(`🎯 Player ${player.originalName} had already chosen ${player.currentChoice} this round - preserving choice for bot ${player.assignedBotName}`);
      console.log(`📊 Current choice preserved: ${player.currentChoice}, hasChosenThisRound: ${player.hasChosenThisRound}`);
    }
    
    // Make the bot choice immediately if game is in progress and they haven't chosen yet
    if (this.gameState === 'playing' && !hadAlreadyChosen) {
      // Use a shorter delay for assigned bots to make transition smoother
      const delay = Math.min(1000, this.botAI.calculateResponseDelay()); // Max 1 second delay
      setTimeout(() => {
        if (!player.hasChosenThisRound && !player.isEliminated) {
          const gameContext = this.createGameContext();
          const choice = this.botAI.calculateBotChoice(player, gameContext);
          console.log(`🤖 Bot ${player.assignedBotName} making choice: ${choice}`);
          this.makeChoiceForAssignedBot(player.id, choice);
        }
      }, delay);
    }
    
    // Debug: Check if all players have chosen after bot assignment
    if (this.gameState === 'playing') {
      setTimeout(() => {
        const activePlayers = this.getActivePlayers();
        const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
        console.log(`🔍 After bot assignment - ${chosenCount}/${activePlayers.length} players have chosen:`);
        activePlayers.forEach(p => {
          console.log(`  - ${p.assignedBotName || p.name} (${p.isBot ? 'Bot' : 'Human'}): ${p.hasChosenThisRound ? 'CHOSEN' : 'WAITING'}`);
        });
        
        // Check if all have chosen and round should proceed
        const allChosen = activePlayers.every(p => p.hasChosenThisRound);
        if (allChosen) {
          console.log(`✅ All players have chosen after bot assignment - round should proceed`);
        } else {
          console.log(`⏳ Still waiting for ${activePlayers.filter(p => !p.hasChosenThisRound).length} players to choose`);
        }
      }, 100);
    }
  }

  /**
   * Mark a player as left (disconnected) instead of removing them
   * @param {string} playerId - Player ID to mark as left
   * @returns {boolean} Whether room should be deleted
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player && !player.isBot) {
      // Only mark as left if game has started, otherwise remove completely
      if (this.gameState === 'waiting') {
        // Game hasn't started yet, remove player completely
        this.players.delete(playerId);
      } else {
        // Game has started, mark as left
        player.hasLeft = true;
        player.hasChosenThisRound = false; // Reset their choice status
        
        // Check if this was a solo game (only 1 human player)
        const humanPlayers = Array.from(this.players.values()).filter(p => !p.isBot);
        const activeHumanPlayers = humanPlayers.filter(p => !p.hasLeft);
        
        if (humanPlayers.length === 1 && activeHumanPlayers.length === 0) {
          // Solo game - just end the game when the single human leaves
          console.log(`🔚 Solo game ended in room ${this.roomId} - single player ${playerId} left`);
          this.gameState = 'finished';
          this.io.to(this.roomId).emit('gameFinished', {
            winner: 'Game ended - player left',
            finalScores: Array.from(this.players.values()),
            reason: 'solo_player_left'
          });
        } else {
          // Multiplayer game - handle bot assignment if enabled
          if (this.botAssignmentEnabled) {
            this.assignBotToLeftPlayer(player);
            
            // Check if only bots remain after this player left
            if (this.onlyBotsRemaining() && this.gameState === 'playing') {
              console.log(`🤖 Terminating game in room ${this.roomId} - only bots remaining after player ${playerId} left`);
              this.gameState = 'finished';
              this.io.to(this.roomId).emit('gameFinished', {
                winner: 'Game terminated - no human players remaining',
                finalScores: Array.from(this.players.values()),
                reason: 'no_humans'
              });
            }
          } else {
            console.log(`👋 Player ${playerId} left room ${this.roomId} - no bot assigned (disabled by admin)`);
          }
        }
      }
      this.playersReady.delete(playerId); // Remove from ready set
    } else {
      // Remove bots completely (they can be recreated)
      this.players.delete(playerId);
    }
    
    // Check if only left players remain (or no players at all)
    const activePlayers = Array.from(this.players.values()).filter(p => !p.hasLeft);
    if (activePlayers.length === 0) {
      return true; // Room should be deleted
    }
    return false;
  }

  /**
   * Fill room with bot players
   */
  fillWithBots() {
    // Only fill with bots if game hasn't started yet
    if (this.gameState !== 'waiting') {
      console.log(`⚠️ Cannot add bots to room ${this.roomId} - game already in progress (state: ${this.gameState})`);
      return;
    }

    // Count only non-left players for bot calculation
    const activePlayerCount = Array.from(this.players.values()).filter(p => !p.hasLeft).length;
    const botsNeeded = Math.max(0, this.maxPlayers - activePlayerCount);
    
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
      console.log(`🤖 Added bot ${botName} to room ${this.roomId}`);
    }
  }

  /**
   * Get currently active game rules
   * @returns {Array} Array of active rule descriptions
   */
  getActiveRules() {
    const rules = [];
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && !p.hasLeft);
    
    rules.push("No input within time limit → Lose 2 points (2nd timeout = elimination)");
    if (this.eliminatedCount >= RULE_THRESHOLDS.DUPLICATE_RULE) {
      rules.push("Duplicate numbers → All choosing them lose 1 point");
    }
    if (this.eliminatedCount >= RULE_THRESHOLDS.PERFECT_TARGET_RULE) {
      rules.push("Exact correct number → Other players lose 2 points");
    }
    // Zero-hundred gambit only applies when exactly 2 players remain
    if (activePlayers.length === 2) {
      rules.push("If one player chooses 0, another can win by choosing 100");
    }
    return rules;
  }

  /**
   * Start the game
   * @returns {boolean} Success status
   */
  startGame() {
    // Prevent starting if game is already in progress
    if (this.gameState !== 'waiting') {
      console.log(`⚠️ Cannot start game in room ${this.roomId} - already in progress (state: ${this.gameState})`);
      return false;
    }

    const activePlayers = Array.from(this.players.values()).filter(p => !p.hasLeft);
    if (activePlayers.length < this.minPlayers) return false;
    
    // Always fill with bots to have 5 players total
    this.fillWithBots();
    
    this.gameState = 'countdown';
    this.startCountdown();
    console.log(`🚀 Game started in room ${this.roomId} with ${activePlayers.length} players`);
    return true;
  }

  /**
   * Start game countdown
   */
  startCountdown() {
    let countdown = 3;
    this.countdownTimer = setInterval(() => {
      this.io.to(this.roomId).emit('countdown', countdown);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(this.countdownTimer);
        this.gameState = 'playing';
        this.startNewRound();
      }
    }, 1000);
  }

  /**
   * Start a new round
   */
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
      this.io.to(this.roomId).emit('roundTimer', timeLeft);
      timeLeft--;
      
      if (timeLeft < 0) {
        clearInterval(this.roundTimer);
        this.processRound();
      }
    }, 1000);

    // Make bot choices with staggered delays
    setTimeout(() => this.makeBotChoices(), 2000);

    this.io.to(this.roomId).emit('newRound', {
      round: this.currentRound,
      activeRules: this.getActiveRules(),
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot,
        hasLeft: p.hasLeft || false,
        originalName: p.originalName,
        assignedBotName: p.assignedBotName
      }))
    });

    // Send initial choice count update
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && !p.hasLeft);
    const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
    this.io.to(this.roomId).emit('choiceUpdate', {
      chosenCount,
      totalActivePlayers: activePlayers.length
    });
  }

  /**
   * Make choices for all bot players
   */
  makeBotChoices() {
    // Regular bots (not left players)
    const regularBots = Array.from(this.players.values()).filter(player => 
      player.isBot && !player.isEliminated && !player.hasLeft);
    
    // Assigned bots (left players with assigned bots)
    const assignedBots = Array.from(this.players.values()).filter(player => 
      player.isBot && !player.isEliminated && player.hasLeft && player.assignedBotName);
    
    // Handle regular bots
    regularBots.forEach((player) => {
      const delay = this.botAI.calculateResponseDelay();
      
      setTimeout(() => {
        if (this.gameState === 'playing' && !player.hasChosenThisRound && !player.isEliminated && !player.hasLeft) {
          const gameContext = this.createGameContext();
          const choice = this.botAI.calculateBotChoice(player, gameContext);
          this.makeChoice(player.id, choice);
        }
      }, delay);
    });
    
    // Handle assigned bots
    assignedBots.forEach((player) => {
      const delay = this.botAI.calculateResponseDelay();
      
      setTimeout(() => {
        if (this.gameState === 'playing' && !player.hasChosenThisRound && !player.isEliminated) {
          const gameContext = this.createGameContext();
          const choice = this.botAI.calculateBotChoice(player, gameContext);
          this.makeChoiceForAssignedBot(player.id, choice);
        }
      }, delay);
    });
  }

  /**
   * Create game context for bot AI
   * @returns {Object} Game context object
   */
  createGameContext() {
    // Include both active players and assigned bots
    const activePlayers = Array.from(this.players.values()).filter(p => 
      !p.isEliminated && (!p.hasLeft || p.assignedBotName)
    );
    return {
      activeRules: this.getActiveRules(),
      activePlayers: activePlayers,
      roundHistory: this.roundHistory,
      eliminatedCount: this.eliminatedCount,
      currentRound: this.currentRound
    };
  }

  /**
   * Record a player's choice (special version for assigned bots)
   * @param {string} playerId - Player ID
   * @param {number} choice - Player's choice (0-100)
   * @returns {boolean} Success status
   */
  makeChoiceForAssignedBot(playerId, choice) {
    const player = this.players.get(playerId);
    // Allow assigned bots (hasLeft=true but isBot=true with assignedBotName) to make choices
    if (!player || player.isEliminated || player.hasChosenThisRound) return false;
    if (!player.isBot || !player.assignedBotName) return false; // Only for assigned bots
    
    player.currentChoice = choice;
    player.hasChosenThisRound = true;
    
    // Calculate active players including both humans and assigned bots
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && (!p.hasLeft || p.assignedBotName));
    const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
    
    // Determine display name for the player who just made a choice
    const displayName = `🤖 ${player.assignedBotName} (for ${player.originalName})`;
    
    this.io.to(this.roomId).emit('choiceUpdate', {
      chosenCount: chosenCount,
      totalActivePlayers: activePlayers.length,
      lastPlayerName: displayName,
      timestamp: Date.now()
    });

    console.log(`📊 Choice update sent: ${chosenCount}/${activePlayers.length} players have chosen in room ${this.roomId} (Assigned Bot: ${player.assignedBotName} for ${player.originalName})`);
    
    // Check if all players (including assigned bots) have chosen
    const allActivePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && (!p.hasLeft || p.assignedBotName));
    const allChosen = allActivePlayers.every(p => p.hasChosenThisRound);
    
    console.log(`🔍 After assigned bot choice - allChosen: ${allChosen}, active players: ${allActivePlayers.length}`);
    allActivePlayers.forEach(p => {
      console.log(`  - ${p.assignedBotName || p.name}: ${p.hasChosenThisRound ? 'CHOSEN' : 'WAITING'}`);
    });
    
    if (allChosen) {
      console.log(`✅ All players chosen - clearing round timer and processing round`);
      clearInterval(this.roundTimer);
      this.processRound();
    }
    
    return true;
  }

  /**
   * Record a player's choice
   * @param {string} playerId - Player ID
   * @param {number} choice - Player's choice (0-100)
   * @returns {boolean} Success status
   */
  makeChoice(playerId, choice) {
    const player = this.players.get(playerId);
    if (!player || player.isEliminated || player.hasLeft || player.hasChosenThisRound) return false;
    
    player.currentChoice = choice;
    player.hasChosenThisRound = true;
    
    // Use consistent active player filtering
    const activePlayers = this.getActivePlayers();
    const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
    
    // Determine display name for the player who just made a choice
    let displayName;
    if (player.isBot) {
      if (player.assignedBotName) {
        // Bot assigned to a left human player
        displayName = `🤖 ${player.assignedBotName} (for ${player.originalName})`;
      } else {
        // Regular bot
        displayName = `🤖 ${player.name}`;
      }
    } else {
      displayName = '👤 Player';
    }
    
    this.io.to(this.roomId).emit('choiceUpdate', {
      chosenCount,
      totalActivePlayers: activePlayers.length,
      lastPlayerName: displayName, // More informative display
      timestamp: Date.now()
    });

    console.log(`📊 Choice update sent: ${chosenCount}/${activePlayers.length} players have chosen in room ${this.roomId} (${player.isBot ? 'Bot' : 'Human'}: ${player.assignedBotName || player.name})`);
    
    // Check if all active players (including assigned bots) have chosen
    const allChosen = activePlayers.every(p => p.hasChosenThisRound);
    
    if (allChosen) {
      clearInterval(this.roundTimer);
      this.processRound();
    }
    
    return true;
  }

  /**
   * Process the current round results
   */
  processRound() {
    // Use consistent active player filtering
    const activePlayers = this.getActivePlayers();
    
    // Track point losses for each player this round
    const pointLosses = new Map();
    activePlayers.forEach(player => {
      pointLosses.set(player.id, { name: player.originalName || player.name, losses: [] });
    });
    
    // Apply timeout penalty for players who didn't choose
    const timeoutPlayers = [];
    const eliminatedByTimeout = [];
    
    activePlayers.forEach(player => {
      if (!player.hasChosenThisRound) {
        player.timeoutCount++;
        
        if (player.timeoutCount >= GAME_CONFIG.TIMEOUT_ELIMINATION_THRESHOLD) {
          // Second timeout - eliminate the player immediately
          player.isEliminated = true;
          this.eliminatedCount++;
          eliminatedByTimeout.push(player.name);
          pointLosses.get(player.id).losses.push({ reason: 'Second timeout (eliminated)', points: 0 });
          player.currentChoice = null;
        } else {
          // First timeout - apply penalty points
          player.score -= GAME_CONFIG.TIMEOUT_PENALTY;
          timeoutPlayers.push(player.name);
          pointLosses.get(player.id).losses.push({ reason: 'Timeout', points: GAME_CONFIG.TIMEOUT_PENALTY });
          player.currentChoice = null; // Set to null for display purposes
        }
      } else {
        // Player chose this round - reset their timeout count
        player.timeoutCount = 0;
      }
    });
    
    // Get only players who made choices for target calculation
    const playersWithChoices = activePlayers.filter(p => p.hasChosenThisRound);
    const choices = playersWithChoices.map(p => p.currentChoice);
    
    if (choices.length === 0) {
      // No one made a choice, just apply timeout penalties and continue
      this.recordTimeoutRound(timeoutPlayers, eliminatedByTimeout, pointLosses);
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

    winner = this.applyGameRules(playersWithChoices, target, winner, pointLosses);
    this.checkEliminations();
    this.recordRoundResult(activePlayers, playersWithChoices, average, target, winner, timeoutPlayers, eliminatedByTimeout, pointLosses);
    this.checkGameEnd();
  }

  /**
   * Apply game rules to players
   * @param {Array} playersWithChoices - Players who made choices
   * @param {number} target - Calculated target
   * @param {Object} winner - Round winner
   * @param {Map} pointLosses - Map to track point losses
   * @returns {Object} Updated winner after applying rules
   */
  applyGameRules(playersWithChoices, target, winner, pointLosses) {
    const activeRules = this.getActiveRules();
    
    // Rule: Duplicate numbers
    if (activeRules.length >= 2) {
      const choiceCounts = {};
      playersWithChoices.forEach(player => {
        const choice = player.currentChoice;
        choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
      });
      
      playersWithChoices.forEach(player => {
        if (choiceCounts[player.currentChoice] > 1) {
          player.score -= GAME_CONFIG.DUPLICATE_PENALTY;
          pointLosses.get(player.id).losses.push({ reason: 'Duplicate number', points: GAME_CONFIG.DUPLICATE_PENALTY });
        }
      });
    }
    
    // Rule: Exact correct number
    if (activeRules.length >= 3) {
      const exactMatch = playersWithChoices.find(p => p.currentChoice === Math.round(target));
      if (exactMatch) {
        playersWithChoices.forEach(player => {
          if (player.id !== exactMatch.id) {
            player.score -= GAME_CONFIG.PERFECT_TARGET_PENALTY;
            pointLosses.get(player.id).losses.push({ reason: 'Someone hit exact target', points: GAME_CONFIG.PERFECT_TARGET_PENALTY });
          }
        });
      }
    }
    
    // Rule: 0 and 100 rule (only applies when exactly 2 players remain)
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && !p.hasLeft);
    if (activePlayers.length === 2) {
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
          pointLosses.get(player.id).losses.push({ reason: 'Not closest to target', points: 1 });
        }
      });
    }
    
    return winner; // Return the updated winner
  }

  /**
   * Check for player eliminations
   */
  checkEliminations() {
    this.players.forEach(player => {
      if (player.score <= GAME_CONFIG.ELIMINATION_SCORE && !player.isEliminated) {
        player.isEliminated = true;
        this.eliminatedCount++;
      }
    });
  }

  /**
   * Record round result in history
   * @param {Array} activePlayers - All active players
   * @param {Array} playersWithChoices - Players who made choices
   * @param {number} average - Average of choices
   * @param {number} target - Calculated target
   * @param {Object} winner - Round winner
   * @param {Array} timeoutPlayers - Players who timed out (first time)
   * @param {Array} eliminatedByTimeout - Players eliminated by timeout (second time)
   * @param {Map} pointLosses - Map of point losses for each player
   */
  recordRoundResult(activePlayers, playersWithChoices, average, target, winner, timeoutPlayers, eliminatedByTimeout = [], pointLosses) {
    const roundResult = {
      round: this.currentRound,
      choices: activePlayers.map(p => ({ 
        name: p.name, 
        choice: p.currentChoice,
        timedOut: !p.hasChosenThisRound,
        pointLosses: pointLosses.get(p.id).losses
      })),
      average: playersWithChoices.length > 0 ? average : 0,
      target: playersWithChoices.length > 0 ? target : 0,
      winner: winner ? winner.name : 'No winner',
      timeoutPlayers,
      eliminatedByTimeout, // Players eliminated by 2nd timeout
      eliminatedThisRound: Array.from(this.players.values())
        .filter(p => p.isEliminated && p.score === GAME_CONFIG.ELIMINATION_SCORE)
        .map(p => p.name)
        .concat(eliminatedByTimeout) // Include timeout eliminations
    };
    
    this.roundHistory.push(roundResult);
    
    // Emit round results
    this.io.to(this.roomId).emit('roundResult', {
      ...roundResult,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot,
        hasLeft: p.hasLeft || false,
        currentChoice: p.currentChoice,
        originalName: p.originalName,
        assignedBotName: p.assignedBotName
      }))
    });
  }

  /**
   * Record timeout-only round
   * @param {Array} timeoutPlayers - Players who timed out (first time)
   * @param {Array} eliminatedByTimeout - Players eliminated by timeout (second time)
   */
  recordTimeoutRound(timeoutPlayers, eliminatedByTimeout = [], pointLosses) {
    this.checkEliminations();

    const roundResult = {
      round: this.currentRound,
      choices: Array.from(this.players.values())
        .filter(p => !p.isEliminated && !p.hasLeft)
        .map(p => ({
          name: p.name,
          choice: null,
          timedOut: true,
          pointLosses: pointLosses.get(p.id).losses
        })),
      average: 0,
      target: 0,
      winner: 'No winner - All players timed out',
      timeoutPlayers,
      eliminatedByTimeout, // Players eliminated by 2nd timeout
      eliminatedThisRound: Array.from(this.players.values())
        .filter(p => p.isEliminated && p.score <= GAME_CONFIG.ELIMINATION_SCORE)
        .map(p => p.name)
        .concat(eliminatedByTimeout) // Include timeout eliminations
    };

    this.roundHistory.push(roundResult);
    this.checkGameEnd();
    
    // Emit round results
    this.io.to(this.roomId).emit('roundResult', {
      ...roundResult,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isEliminated: p.isEliminated,
        isBot: p.isBot,
        currentChoice: p.currentChoice,
        originalName: p.originalName,
        assignedBotName: p.assignedBotName
      }))
    });
  }

  /**
   * Get active players based on bot assignment setting
   * @returns {Array} Array of active players
   */
  getActivePlayers() {
    if (this.botAssignmentEnabled) {
      // Include assigned bots as active players
      return Array.from(this.players.values()).filter(p => !p.isEliminated && (!p.hasLeft || p.assignedBotName));
    } else {
      // Only include non-left players
      return Array.from(this.players.values()).filter(p => !p.isEliminated && !p.hasLeft);
    }
  }

  /**
   * Check if only bots remain in the game
   * @returns {boolean} True if only bots are left playing
   */
  onlyBotsRemaining() {
    const activePlayers = this.getActivePlayers();
    const humanPlayers = activePlayers.filter(p => !p.hasLeft && !p.isBot); // Non-left human players
    
    if (!this.botAssignmentEnabled) {
      // If bot assignment is disabled, check if any human players remain
      return humanPlayers.length === 0 && activePlayers.length > 0;
    }
    
    const assignedBotPlayers = activePlayers.filter(p => p.hasLeft && p.assignedBotName); // Count assigned bots as human representation
    
    return (humanPlayers.length + assignedBotPlayers.length) === 0 && activePlayers.length > 0;
  }

  /**
   * Check if game should end
   */
  checkGameEnd() {
    const remainingPlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && (!p.hasLeft || p.assignedBotName));
    
    // Check if only bots remain - terminate game immediately
    if (this.onlyBotsRemaining()) {
      this.gameState = 'finished';
      console.log(`🤖 Game terminated in room ${this.roomId} - only bots remaining`);
      
      this.io.to(this.roomId).emit('gameFinished', {
        winner: 'Game terminated - no human players remaining',
        finalScores: Array.from(this.players.values()),
        reason: 'no_humans'
      });
      return;
    }
    
    if (remainingPlayers.length <= 1) {
      this.gameState = 'finished';
      const winner = remainingPlayers[0];
      const winnerName = winner ? (winner.originalName || winner.name) : 'No winner';
      
      this.io.to(this.roomId).emit('gameFinished', {
        winner: winnerName,
        finalScores: Array.from(this.players.values())
      });
    } else {
      // Start next round countdown
      this.startNextRoundCountdown();
    }
  }

  /**
   * Start countdown for next round
   */
  startNextRoundCountdown() {
    this.playersReady.clear(); // Reset ready states
    let countdown = this.nextRoundDelay;
    
    // Emit initial countdown
    this.io.to(this.roomId).emit('nextRoundCountdown', countdown);
    
    this.nextRoundTimer = setInterval(() => {
      countdown--;
      this.io.to(this.roomId).emit('nextRoundCountdown', countdown);
      
      if (countdown <= 0) {
        clearInterval(this.nextRoundTimer);
        this.startNewRound();
      }
    }, 1000);
  }

  /**
   * Mark player as ready for next round
   * @param {string} playerId - Player ID
   */
  playerReady(playerId) {
    this.playersReady.add(playerId);
    
    // Auto-mark all bots (including assigned bots) as ready when a human player is ready
    const botPlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && p.isBot);
    botPlayers.forEach(bot => {
      this.playersReady.add(bot.id);
    });
    
    // Check if all non-eliminated players (including assigned bots) are ready
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated && (!p.hasLeft || p.assignedBotName));
    const allReady = activePlayers.every(p => this.playersReady.has(p.id));
    
    // Emit ready status update to all players
    const readyCount = this.playersReady.size;
    const totalActive = activePlayers.length;
    this.io.to(this.roomId).emit('readyUpdate', {
      readyCount,
      totalActive,
      allReady
    });
    
    if (allReady && this.nextRoundTimer) {
      clearInterval(this.nextRoundTimer);
      this.io.to(this.roomId).emit('nextRoundCountdown', 0); // Signal immediate start
      setTimeout(() => this.startNewRound(), 100); // Small delay for smooth transition
    }
  }
}

module.exports = GameRoom;
