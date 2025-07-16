// 🛠️ King of Diamonds - Utility Functions 💎

/**
 * Generate a random room ID
 * @param {number} length - Length of the room ID
 * @returns {string} Random room ID
 */
function generateRoomId(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

/**
 * Validate player name
 * @param {string} name - Player name to validate
 * @returns {Object} Validation result
 */
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmedName.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' };
  }
  
  // Check for inappropriate content (basic filter)
  const inappropriate = ['bot', 'admin', 'server', 'null', 'undefined'];
  if (inappropriate.some(word => trimmedName.toLowerCase().includes(word))) {
    return { valid: false, error: 'Name contains inappropriate content' };
  }
  
  return { valid: true, name: trimmedName };
}

/**
 * Validate room ID format
 * @param {string} roomId - Room ID to validate
 * @returns {boolean} Whether the room ID is valid
 */
function validateRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  
  // Room IDs should be 6 characters, alphanumeric, uppercase
  const roomIdRegex = /^[A-Z0-9]{6}$/;
  return roomIdRegex.test(roomId.toUpperCase());
}

/**
 * Validate player choice
 * @param {any} choice - Choice to validate
 * @returns {Object} Validation result
 */
function validateChoice(choice) {
  if (typeof choice !== 'number') {
    return { valid: false, error: 'Choice must be a number' };
  }
  
  if (!Number.isInteger(choice)) {
    return { valid: false, error: 'Choice must be an integer' };
  }
  
  if (choice < 0 || choice > 100) {
    return { valid: false, error: 'Choice must be between 0 and 100' };
  }
  
  return { valid: true, choice };
}

/**
 * Sanitize player data for public consumption
 * @param {Object} player - Player object
 * @param {boolean} includeChoice - Whether to include current choice
 * @returns {Object} Sanitized player data
 */
function sanitizePlayerData(player, includeChoice = false) {
  const sanitized = {
    id: player.id,
    name: player.name,
    score: player.score,
    isEliminated: player.isEliminated,
    isBot: player.isBot
  };
  
  if (includeChoice) {
    sanitized.currentChoice = player.currentChoice;
    sanitized.hasChosenThisRound = player.hasChosenThisRound;
  }
  
  return sanitized;
}

/**
 * Calculate game statistics
 * @param {Array} roundHistory - Array of round results
 * @returns {Object} Game statistics
 */
function calculateGameStats(roundHistory) {
  if (!roundHistory || roundHistory.length === 0) {
    return {
      totalRounds: 0,
      averageTarget: 0,
      averageChoicesPerRound: 0,
      mostCommonChoice: null,
      highestScore: 0,
      lowestScore: 0
    };
  }
  
  const totalRounds = roundHistory.length;
  const targets = roundHistory.map(r => r.target).filter(t => t > 0);
  const averageTarget = targets.length > 0 ? targets.reduce((a, b) => a + b) / targets.length : 0;
  
  // Collect all choices
  const allChoices = [];
  roundHistory.forEach(round => {
    round.choices.forEach(choice => {
      if (choice.choice !== null && !choice.timedOut) {
        allChoices.push(choice.choice);
      }
    });
  });
  
  const averageChoicesPerRound = allChoices.length / totalRounds;
  
  // Find most common choice
  const choiceCounts = {};
  allChoices.forEach(choice => {
    choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
  });
  
  let mostCommonChoice = null;
  let maxCount = 0;
  for (const [choice, count] of Object.entries(choiceCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonChoice = parseInt(choice);
    }
  }
  
  return {
    totalRounds,
    averageTarget: Math.round(averageTarget * 100) / 100,
    averageChoicesPerRound: Math.round(averageChoicesPerRound * 100) / 100,
    mostCommonChoice,
    totalChoices: allChoices.length
  };
}

/**
 * Format time duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Rate limiter for API endpoints
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Rate limiting middleware
 */
function createRateLimiter(maxRequests, windowMs) {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [id, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => now - time < windowMs);
      if (validTimestamps.length === 0) {
        requests.delete(id);
      } else {
        requests.set(id, validTimestamps);
      }
    }
    
    // Check current client
    const clientRequests = requests.get(clientId) || [];
    const validRequests = clientRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(clientId, validRequests);
    
    next();
  };
}

module.exports = {
  generateRoomId,
  validatePlayerName,
  validateRoomId,
  validateChoice,
  sanitizePlayerData,
  calculateGameStats,
  formatDuration,
  shuffleArray,
  deepClone,
  debounce,
  createRateLimiter
};
