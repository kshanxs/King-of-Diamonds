// 🎯 King of Diamonds - Game Constants & Configuration 💎

// Bot names for AI players
const BOT_NAMES = [
  'King of Hearts', 'Queen of Diamonds', 'King of Spades', 'Queen of Clubs',
  'King of Diamonds', 'Queen of Hearts', 'King of Clubs', 'Queen of Spades',
  'Jack of Hearts', 'Jack of Diamonds', 'Jack of Spades', 'Jack of Clubs',
  'Ace of Hearts', 'Ace of Diamonds', 'Ace of Spades', 'Ace of Clubs'
];

// Game configuration
const GAME_CONFIG = {
  MAX_PLAYERS: 5,
  MIN_PLAYERS: 1,
  ROUND_TIME_LIMIT: 60, // seconds
  NEXT_ROUND_DELAY: 10, // seconds
  ELIMINATION_SCORE: -10,
  TIMEOUT_PENALTY: -2,
  DUPLICATE_PENALTY: -1,
  PERFECT_TARGET_PENALTY: -2
};

// Bot AI configuration
const BOT_CONFIG = {
  RESPONSE_DELAY_MIN: 3000, // 3 seconds
  RESPONSE_DELAY_MAX: 15000, // 15 seconds
  PERSONALITIES: {
    KING: { type: 'aggressive', riskTolerance: 0.8, calculationFocus: 0.6 },
    QUEEN: { type: 'balanced', riskTolerance: 0.5, calculationFocus: 0.8 },
    JACK: { type: 'unpredictable', riskTolerance: 0.7, calculationFocus: 0.4 },
    ACE: { type: 'mathematical', riskTolerance: 0.3, calculationFocus: 0.9 },
    DEFAULT: { type: 'balanced', riskTolerance: 0.5, calculationFocus: 0.6 }
  }
};

// Server configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 5001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// Game rules activation thresholds
const RULE_THRESHOLDS = {
  DUPLICATE_RULE: 1,      // Activated after 1 elimination
  PERFECT_TARGET_RULE: 2, // Activated after 2 eliminations
  ZERO_HUNDRED_RULE: 3    // Activated after 3 eliminations
};

// Round numbers that bots tend to avoid
const ROUND_NUMBERS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

module.exports = {
  BOT_NAMES,
  GAME_CONFIG,
  BOT_CONFIG,
  SERVER_CONFIG,
  RULE_THRESHOLDS,
  ROUND_NUMBERS
};
