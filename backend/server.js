// 🎮 King of Diamonds - Main Server File 💎

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import modules
const { SERVER_CONFIG } = require('./config/constants');
const apiRoutes = require('./routes/api');
const { initializeSocketHandlers } = require('./handlers/socketHandlers');
const { createRateLimiter } = require('./utils/gameUtils');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: SERVER_CONFIG.CORS_ORIGIN,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Game state storage
const rooms = new Map();
const playerSockets = new Map();

// Make rooms and io available to routes
app.locals.rooms = rooms;
app.locals.io = io;

// Middleware
app.use(cors({
  origin: SERVER_CONFIG.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for API endpoints
app.use('/api', createRateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📊 [${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint (separate from API routes for load balancers)
app.get('/health', (req, res) => {
  // Calculate total players across all rooms
  let totalPlayers = 0;
  rooms.forEach(room => {
    totalPlayers += room.players?.length || 0;
  });

  res.status(200).json({
    status: 'ok',
    server: 'King of Diamonds Game Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: SERVER_CONFIG.NODE_ENV,
    rooms: rooms.size,
    players: totalPlayers,
    activeSockets: playerSockets.size,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage()
    }
  });
});

// Connection test endpoint for debugging
app.get('/test-connection', (req, res) => {
  res.status(200).json({
    message: 'Backend server is reachable',
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    headers: req.headers,
    corsOrigin: SERVER_CONFIG.CORS_ORIGIN,
    port: SERVER_CONFIG.PORT
  });
});

// API routes
app.use('/api', apiRoutes);

// Serve static files in production
if (SERVER_CONFIG.NODE_ENV === 'production') {
  app.use(express.static('public'));
  
  // Catch-all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  
  if (SERVER_CONFIG.NODE_ENV === 'development') {
    res.status(500).json({
      error: 'Internal server error',
      details: err.message,
      stack: err.stack
    });
  } else {
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Initialize Socket.io handlers
initializeSocketHandlers(io, rooms, playerSockets);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  
  // Close all socket connections
  io.close(() => {
    console.log('🔌 Socket.io server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('🌐 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  
  // Close all socket connections
  io.close(() => {
    console.log('🔌 Socket.io server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('🌐 HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  
  // Graceful shutdown
  io.close();
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Graceful shutdown
  io.close();
  server.close(() => {
    process.exit(1);
  });
});

// Start server
server.listen(SERVER_CONFIG.PORT, '0.0.0.0', () => {
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = Object.values(networkInterfaces)
    .flat()
    .filter(addr => addr.family === 'IPv4' && !addr.internal)
    .map(addr => addr.address);

  console.log('🎮 ========================================');
  console.log('💎 King of Diamonds Server Started! 💎');
  console.log('🎮 ========================================');
  console.log(`🌐 Server running on port ${SERVER_CONFIG.PORT}`);
  console.log(`🔧 Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('');
  console.log('🔗 Server accessible at:');
  console.log(`   Local:  http://localhost:${SERVER_CONFIG.PORT}`);
  console.log(`   Local:  http://127.0.0.1:${SERVER_CONFIG.PORT}`);
  
  if (addresses.length > 0) {
    console.log('   LAN:');
    addresses.forEach(addr => {
      console.log(`           http://${addr}:${SERVER_CONFIG.PORT}`);
    });
    console.log('');
    console.log('📱 Share LAN addresses with other players on your network!');
    console.log('🎯 Frontend should be accessible at:');
    addresses.forEach(addr => {
      console.log(`           http://${addr}:5173`);
    });
  } else {
    console.log('⚠️  No network interfaces found for LAN play');
  }
  
  console.log('');
  console.log('🎯 Ready for players!');
  console.log('🎮 ========================================');
});

// Periodic server statistics logging
setInterval(() => {
  const stats = {
    activeRooms: rooms.size,
    activePlayers: playerSockets.size,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  if (SERVER_CONFIG.NODE_ENV === 'development') {
    console.log('📊 Server Stats:', stats);
  }
}, 300000); // Every 5 minutes

module.exports = { app, server, io };
