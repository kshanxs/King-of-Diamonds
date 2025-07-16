// 🌐 King of Diamonds - API Routes 💎

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const GameRoom = require('../models/GameRoom');

const router = express.Router();

/**
 * Create a new game room
 * POST /api/create-room
 * Body: { playerName: string }
 * Returns: { roomId: string, playerId: string }
 */
router.post('/create-room', (req, res) => {
  const { playerName } = req.body;
  
  if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const playerId = uuidv4();
  
  // Get rooms and io from app context (set by main server)
  const { rooms, io } = req.app.locals;
  
  const room = new GameRoom(roomId, playerId, io);
  room.addPlayer(playerId, playerName.trim());
  rooms.set(roomId, room);
  
  res.json({ roomId, playerId });
});

/**
 * Join an existing game room
 * POST /api/join-room
 * Body: { roomId: string, playerName: string }
 * Returns: { playerId: string }
 */
router.post('/join-room', (req, res) => {
  const { roomId, playerName } = req.body;
  
  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  
  if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  const { rooms } = req.app.locals;
  const room = rooms.get(roomId.toUpperCase());
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  if (room.gameState !== 'waiting') {
    return res.status(400).json({ error: 'Game already in progress' });
  }
  
  const playerId = uuidv4();
  const success = room.addPlayer(playerId, playerName.trim());
  
  if (!success) {
    return res.status(400).json({ error: 'Room is full' });
  }
  
  res.json({ playerId });
});

/**
 * Get room information
 * GET /api/room/:roomId
 * Returns: Room details or error
 */
router.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { rooms } = req.app.locals;
  
  const room = rooms.get(roomId.toUpperCase());
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId: room.roomId,
    gameState: room.gameState,
    currentRound: room.currentRound,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isEliminated: p.isEliminated,
      isBot: p.isBot
    })),
    activeRules: room.getActiveRules()
  });
});

/**
 * Get game statistics
 * GET /api/stats
 * Returns: Server statistics
 */
router.get('/stats', (req, res) => {
  const { rooms } = req.app.locals;
  
  const totalRooms = rooms.size;
  const activeGames = Array.from(rooms.values()).filter(room => room.gameState === 'playing').length;
  const totalPlayers = Array.from(rooms.values()).reduce((count, room) => {
    return count + Array.from(room.players.values()).filter(p => !p.isBot).length;
  }, 0);
  
  res.json({
    totalRooms,
    activeGames,
    totalPlayers,
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check endpoint
 * GET /health
 * Returns: Health status
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
