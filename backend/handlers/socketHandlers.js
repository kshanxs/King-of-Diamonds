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
            hasLeft: p.hasLeft || false,
            originalName: p.originalName,
            assignedBotName: p.assignedBotName
          })),
          gameState: room.gameState,
          currentRound: room.currentRound,
          activeRules: room.getActiveRules(),
          roundHistory: room.roundHistory,
          botAssignmentEnabled: room.botAssignmentEnabled,
          isHost: room.hostId === playerId
        });

        // Send current choice count if game is playing
        if (room.gameState === 'playing') {
          const activePlayers = room.getActivePlayers();
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
            hasLeft: p.hasLeft || false,
            originalName: p.originalName,
            assignedBotName: p.assignedBotName
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

        // Prevent starting game if already in progress
        if (room.gameState !== 'waiting') {
          socket.emit('error', 'Game already in progress');
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
     * Handle bot assignment toggle (admin only)
     */
    socket.on('toggleBotAssignment', ({ roomId, playerId, enabled }) => {
      try {
        console.log(`🎮 Toggle bot assignment request: roomId=${roomId}, playerId=${playerId}, enabled=${enabled}`);
        
        const room = rooms.get(roomId);
        if (!room) {
          console.log(`❌ Room ${roomId} not found`);
          socket.emit('error', 'Room not found');
          return;
        }
        
        if (!room.players.has(playerId)) {
          console.log(`❌ Player ${playerId} not found in room ${roomId}`);
          socket.emit('error', 'Player not found in room');
          return;
        }
        
        if (room.hostId !== playerId) {
          console.log(`❌ Player ${playerId} is not host of room ${roomId}. Host is: ${room.hostId}`);
          socket.emit('error', 'Not authorized to change bot assignment settings');
          return;
        }

        // Only allow changes in waiting state
        if (room.gameState !== 'waiting') {
          console.log(`❌ Cannot change bot assignment in room ${roomId} - game state is: ${room.gameState}`);
          socket.emit('error', 'Cannot change bot assignment settings during game');
          return;
        }

        console.log(`✅ Setting bot assignment to ${enabled} in room ${roomId}`);
        room.setBotAssignmentEnabled(enabled);
        
        // Notify all players in the room about the setting change
        io.to(roomId).emit('botAssignmentChanged', { enabled });
        console.log(`🎮 Bot assignment ${enabled ? 'enabled' : 'disabled'} in room ${roomId} by ${playerId}`);
      } catch (error) {
        console.error('❌ Error in toggleBotAssignment:', error);
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
            isBot: p.isBot,
            originalName: p.originalName,
            assignedBotName: p.assignedBotName
          })),
          activeRules: room.getActiveRules(),
          roundHistory: room.roundHistory,
          botAssignmentEnabled: room.botAssignmentEnabled
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
                  // Get updated player after bot assignment
                  const updatedPlayer = room.players.get(playerId);
                  
                  // Notify other players
                  io.to(roomId).emit('playerLeft', {
                    leftPlayerId: disconnectedPlayer.id,
                    leftPlayerName: disconnectedPlayer.name,
                    assignedBotName: updatedPlayer ? updatedPlayer.assignedBotName : null,
                    players: Array.from(room.players.values()).map(p => ({
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
                  
                  if (updatedPlayer && updatedPlayer.assignedBotName) {
                    console.log(`📤 Player ${playerId} left room ${roomId}, bot "${updatedPlayer.assignedBotName}" assigned`);
                  } else {
                    console.log(`📤 Player ${playerId} left room ${roomId}`);
                  }
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
