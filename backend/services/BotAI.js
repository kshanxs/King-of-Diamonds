// 🤖 King of Diamonds - Bot AI Service 💎

const { BOT_CONFIG, RULE_THRESHOLDS, ROUND_NUMBERS } = require('../config/constants');

class BotAI {
  constructor() {
    this.personalities = BOT_CONFIG.PERSONALITIES;
  }

  /**
   * Calculate bot choice based on game state and bot personality
   * @param {Object} bot - Bot player object
   * @param {Object} gameContext - Current game context
   * @returns {number} Bot's choice (0-100)
   */
  calculateBotChoice(bot, gameContext) {
    const { activeRules, activePlayers, roundHistory, eliminatedCount, currentRound } = gameContext;
    const remainingPlayers = activePlayers.length;
    
    // Analyze bot personality based on card type
    const botPersonality = this.getBotPersonality(bot.name);
    
    // Early game strategy (first few rounds or many players)
    if (currentRound <= 2 || remainingPlayers >= 4) {
      return this.earlyGameStrategy(bot, botPersonality, gameContext);
    }
    
    // Mid game strategy (3 players left)
    if (remainingPlayers === 3) {
      return this.midGameStrategy(bot, botPersonality, gameContext);
    }
    
    // End game strategy (2 players left)
    if (remainingPlayers === 2) {
      return this.endGameStrategy(bot, botPersonality, gameContext);
    }
    
    // Fallback to conservative strategy
    return this.conservativeChoice();
  }

  /**
   * Get bot personality based on card name
   * @param {string} botName - Name of the bot
   * @returns {Object} Personality configuration
   */
  getBotPersonality(botName) {
    if (botName.includes('King')) {
      return this.personalities.KING;
    } else if (botName.includes('Queen')) {
      return this.personalities.QUEEN;
    } else if (botName.includes('Jack')) {
      return this.personalities.JACK;
    } else if (botName.includes('Ace')) {
      return this.personalities.ACE;
    }
    return this.personalities.DEFAULT;
  }

  /**
   * Early game strategy implementation
   * @param {Object} bot - Bot player
   * @param {Object} personality - Bot personality
   * @param {Object} gameContext - Game context
   * @returns {number} Choice (0-100)
   */
  earlyGameStrategy(bot, personality, gameContext) {
    const { roundHistory, eliminatedCount, currentRound } = gameContext;
    const historyData = this.analyzeRoundHistory(roundHistory);
    
    // Rule 1: Avoid duplicates if active
    const duplicateRuleActive = eliminatedCount >= RULE_THRESHOLDS.DUPLICATE_RULE;
    
    if (currentRound === 1) {
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

  /**
   * Mid game strategy implementation
   * @param {Object} bot - Bot player
   * @param {Object} personality - Bot personality
   * @param {Object} gameContext - Game context
   * @returns {number} Choice (0-100)
   */
  midGameStrategy(bot, personality, gameContext) {
    const { roundHistory, eliminatedCount } = gameContext;
    const historyData = this.analyzeRoundHistory(roundHistory);
    const duplicateRuleActive = eliminatedCount >= RULE_THRESHOLDS.DUPLICATE_RULE;
    const perfectTargetRuleActive = eliminatedCount >= RULE_THRESHOLDS.PERFECT_TARGET_RULE;
    
    // Calculate expected target based on remaining players
    const predictedTarget = this.predictTargetForRemainingPlayers(gameContext);
    
    // Perfect target consideration
    if (perfectTargetRuleActive && personality.calculationFocus > 0.7 && Math.random() < 0.3) {
      // Attempt perfect target (high risk, high reward)
      return Math.floor(predictedTarget);
    }
    
    // Duplicate avoidance strategy
    if (duplicateRuleActive) {
      const avoidNumbers = this.getCommonNumbers(historyData);
      const riskNumbers = ROUND_NUMBERS; // 10, 20, 30, etc.
      
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

  /**
   * End game strategy implementation
   * @param {Object} bot - Bot player
   * @param {Object} personality - Bot personality
   * @param {Object} gameContext - Game context
   * @returns {number} Choice (0-100)
   */
  endGameStrategy(bot, personality, gameContext) {
    const { activePlayers, eliminatedCount } = gameContext;
    const zeroHundredRuleActive = eliminatedCount >= RULE_THRESHOLDS.ZERO_HUNDRED_RULE;
    const duplicateRuleActive = eliminatedCount >= RULE_THRESHOLDS.DUPLICATE_RULE;
    const perfectTargetRuleActive = eliminatedCount >= RULE_THRESHOLDS.PERFECT_TARGET_RULE;
    
    // Zero-hundred gambit consideration
    if (zeroHundredRuleActive) {
      // Analyze opponent's likely strategy
      const opponentBot = activePlayers.find(p => !p.isEliminated && p.id !== bot.id);
      
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
    const predictedTarget = this.predictTargetForTwoPlayers(gameContext);
    
    // Perfect target attempt
    if (perfectTargetRuleActive && personality.calculationFocus > 0.8 && Math.random() < 0.4) {
      return Math.floor(predictedTarget);
    }
    
    // Avoid duplicates and play close to target
    const baseChoice = Math.floor(predictedTarget + (Math.floor(Math.random() * 8) - 4));
    
    // Avoid round numbers if duplicate rule active
    if (duplicateRuleActive && ROUND_NUMBERS.includes(baseChoice) && Math.random() < 0.8) {
      return Math.floor(baseChoice + (Math.random() < 0.5 ? 3 : -3));
    }
    
    return Math.max(0, Math.min(100, baseChoice));
  }

  /**
   * Analyze round history for patterns
   * @param {Array} roundHistory - Array of round results
   * @returns {Object} Analysis data
   */
  analyzeRoundHistory(roundHistory) {
    if (roundHistory.length === 0) {
      return { averageTarget: 40, commonNumbers: [], recentTargets: [] };
    }
    
    const recentRounds = roundHistory.slice(-3); // Last 3 rounds
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

  /**
   * Get numbers to avoid (common + round numbers)
   * @param {Object} historyData - Analyzed history data
   * @returns {Array} Numbers to avoid
   */
  getCommonNumbers(historyData) {
    return [...historyData.commonNumbers, ...ROUND_NUMBERS];
  }

  /**
   * Predict target for remaining players
   * @param {Object} gameContext - Game context
   * @returns {number} Predicted target
   */
  predictTargetForRemainingPlayers(gameContext) {
    const { activePlayers, roundHistory } = gameContext;
    const playerCount = activePlayers.length;
    
    // Analyze recent patterns
    const historyData = this.analyzeRoundHistory(roundHistory);
    
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

  /**
   * Predict target for two players
   * @param {Object} gameContext - Game context
   * @returns {number} Predicted target
   */
  predictTargetForTwoPlayers(gameContext) {
    const { roundHistory } = gameContext;
    const historyData = this.analyzeRoundHistory(roundHistory);
    
    if (historyData.recentTargets.length > 0) {
      const trend = historyData.recentTargets[historyData.recentTargets.length - 1];
      // In 2-player games, targets can be more extreme
      return Math.floor(trend + (Math.floor(Math.random() * 12) - 6));
    }
    
    return Math.floor(35 + (Math.floor(Math.random() * 10) - 5));
  }

  /**
   * Conservative choice for fallback scenarios
   * @returns {number} Conservative choice (35-55 range)
   */
  conservativeChoice() {
    return Math.floor(Math.random() * 21) + 35; // 35-55 range
  }

  /**
   * Calculate response delay for bot
   * @returns {number} Delay in milliseconds
   */
  calculateResponseDelay() {
    return Math.random() * (BOT_CONFIG.RESPONSE_DELAY_MAX - BOT_CONFIG.RESPONSE_DELAY_MIN) + BOT_CONFIG.RESPONSE_DELAY_MIN;
  }
}

module.exports = BotAI;
