// 🔌 King of Diamonds - Socket.io Event Handlers 💎

/**
 * Initialize Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 * @param {Map} rooms - Rooms storage
 * @param {Map} playerSockets - Player socket mapping
 */
function initializeSocketHandlers(io, rooms, playerSockets) {
  
  io.on('connection', (socket) => {
    console.log('🎮 User connected:', socket.id);

    /**
     * Handle player joining a room
     */
    socket.on('joinRoom', ({ roomId, playerId }) => {
      try {
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
            isBot: p.isBot,
            hasLeft: p.hasLeft || false
          })),
          gameState: room.gameState,
          currentRound: room.currentRound,
          activeRules: room.getActiveRules(),
          roundHistory: room.roundHistory
        });

        // Send current choice count if game is playing
        if (room.gameState === 'playing') {
          const activePlayers = Array.from(room.players.values()).filter(p => !p.isEliminated);
          const chosenCount = activePlayers.filter(p => p.hasChosenThisRound).length;
          socket.emit('choiceUpdate', {
            chosenCount,
            totalActivePlayers: activePlayers.length
          });
        }
        
        // Notify other players
        socket.to(roomId).emit('playerJoined', {
          players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            isEliminated: p.isEliminated,
            isBot: p.isBot,
            hasLeft: p.hasLeft || false
          }))
        });

        console.log(`🎯 Player ${playerId} joined room ${roomId}`);
      } catch (error) {
        console.error('❌ Error in joinRoom:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    /**
     * Handle game start request
     */
    socket.on('startGame', ({ roomId, playerId }) => {
      try {
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
          console.log(`🚀 Game started in room ${roomId}`);
        } else {
          socket.emit('error', 'Cannot start game');
        }
      } catch (error) {
        console.error('❌ Error in startGame:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    /**
     * Handle player choice submission
     */
    socket.on('makeChoice', ({ roomId, playerId, choice }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        // Validate choice
        if (typeof choice !== 'number' || choice < 0 || choice > 100 || !Number.isInteger(choice)) {
          socket.emit('error', 'Invalid choice. Must be an integer between 0 and 100');
          return;
        }

        const success = room.makeChoice(playerId, choice);
        if (success) {
          socket.emit('choiceConfirmed', choice);
          console.log(`✅ Player ${playerId} made choice ${choice} in room ${roomId}`);
        }
      } catch (error) {
        console.error('❌ Error in makeChoice:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    /**
     * Handle player ready for next round
     */
    socket.on('playerReady', ({ roomId, playerId }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        room.playerReady(playerId);
        console.log(`⏩ Player ${playerId} ready for next round in room ${roomId}`);
      } catch (error) {
        console.error('❌ Error in playerReady:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    /**
     * Handle player requesting room info
     */
    socket.on('getRoomInfo', ({ roomId }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit('error', 'Room not found');
          return;
        }

        socket.emit('roomInfo', {
          roomId: room.roomId,
          gameState: room.gameState,
          currentRound: room.currentRound,
          players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            isEliminated: p.isEliminated,
            isBot: p.isBot
          })),
          activeRules: room.getActiveRules(),
          roundHistory: room.roundHistory
        });
      } catch (error) {
        console.error('❌ Error in getRoomInfo:', error);
        socket.emit('error', 'Internal server error');
      }
    });

    /**
     * Handle heartbeat/ping for connection monitoring
     */
    socket.on('ping', () => {
      socket.emit('pong');
    });

    /**
     * Handle player disconnect
     */
    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
      
      try {
        // Find and remove player from rooms
        for (const [playerId, socketId] of playerSockets.entries()) {
          if (socketId === socket.id) {
            playerSockets.delete(playerId);
            
            for (const [roomId, room] of rooms.entries()) {
              if (room.players.has(playerId) && !room.players.get(playerId).isBot) {
                const disconnectedPlayer = room.players.get(playerId);
                const shouldDeleteRoom = room.removePlayer(playerId);
                
                if (shouldDeleteRoom) {
                  rooms.delete(roomId);
                  console.log(`🗑️ Room ${roomId} deleted (empty)`);
                } else {
                  // Notify other players
                  io.to(roomId).emit('playerLeft', {
                    leftPlayerId: disconnectedPlayer.id,
                    leftPlayerName: disconnectedPlayer.name,
                    players: Array.from(room.players.values()).map(p => ({
                      id: p.id,
                      name: p.name,
                      score: p.score,
                      isEliminated: p.isEliminated,
                      isBot: p.isBot,
                      hasLeft: p.hasLeft || false
                    }))
                  });
                  console.log(`📤 Player ${playerId} left room ${roomId}`);
                }
                break;
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error('❌ Error handling disconnect:', error);
      }
    });

    /**
     * Handle errors in socket communication
     */
    socket.on('error', (error) => {
      console.error('🔥 Socket error:', error);
    });
  });

  // Periodic cleanup of empty rooms
  setInterval(() => {
    const roomsToDelete = [];
    for (const [roomId, room] of rooms.entries()) {
      const humanPlayers = Array.from(room.players.values()).filter(p => !p.isBot);
      if (humanPlayers.length === 0) {
        roomsToDelete.push(roomId);
      }
    }
    
    roomsToDelete.forEach(roomId => {
      rooms.delete(roomId);
      console.log(`🧹 Cleaned up empty room: ${roomId}`);
    });
    
    if (roomsToDelete.length > 0) {
      console.log(`🧽 Cleanup complete: ${roomsToDelete.length} rooms removed`);
    }
  }, 300000); // Every 5 minutes

  console.log('🔌 Socket.io handlers initialized');
}

module.exports = { initializeSocketHandlers };
