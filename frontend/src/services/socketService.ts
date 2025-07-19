import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config/environment';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = SERVER_URL;
  private connectionAttempts = 0;
  private maxRetries = 3;

  connect(): Socket {
    if (!this.socket) {
      this.connectionAttempts++;
      console.log(`🔗 Connecting to server (attempt ${this.connectionAttempts}): ${this.serverUrl}`);
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'], // Fallback for network issues
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Log connection events for debugging
      this.socket.on('connect', () => {
        console.log('✅ Connected to server successfully');
        this.connectionAttempts = 0; // Reset on successful connection
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🚫 Connection error:', error);
        console.error('🚫 Server URL:', this.serverUrl);
        console.error('🚫 Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // Try alternative connection methods if initial attempts fail
        if (this.connectionAttempts <= this.maxRetries) {
          console.log(`🔄 Retrying connection (${this.connectionAttempts}/${this.maxRetries})...`);
          setTimeout(() => {
            this.socket?.connect();
          }, 2000 * this.connectionAttempts);
        }
      });

      this.socket.on('error', (error) => {
        console.error('🔥 Socket communication error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: unknown) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      // Add debugging for botAssignmentChanged event specifically
      if (event === 'botAssignmentChanged') {
        console.log('🎮 SocketService: Setting up botAssignmentChanged listener');
        this.socket.on(event, (...args) => {
          console.log('🎮 SocketService: botAssignmentChanged event received!', args);
          callback(...args);
        });
      } else {
        this.socket.on(event, callback);
      }
    } else {
      console.log(`⚠️ SocketService: Cannot set up ${event} listener - socket is null`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinRoom(roomId: string, playerId: string) {
    console.log(`🚪 Attempting to join room: ${roomId} with player: ${playerId}`);
    
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, attempting to connect first...');
      this.connect();
      
      // Wait for connection before joining
      this.socket?.on('connect', () => {
        console.log('✅ Socket connected, now joining room...');
        this.emit('joinRoom', { roomId, playerId });
      });
    } else {
      this.emit('joinRoom', { roomId, playerId });
    }

    // Set up a timeout to detect if room join is hanging
    const joinTimeout = setTimeout(() => {
      console.error('⏰ Room join timeout - no response from server');
      console.error('🔍 Debug info:', {
        socketConnected: this.socket?.connected,
        serverUrl: this.serverUrl,
        roomId,
        playerId
      });
    }, 10000); // 10 second timeout

    // Clear timeout when we successfully join
    this.socket?.once('roomJoined', () => {
      clearTimeout(joinTimeout);
      console.log('✅ Successfully joined room');
    });

    // Clear timeout on error as well
    this.socket?.once('error', () => {
      clearTimeout(joinTimeout);
    });
  }

  startGame(roomId: string, playerId: string) {
    this.emit('startGame', { roomId, playerId });
  }

  toggleBotAssignment(roomId: string, playerId: string, enabled: boolean) {
    console.log(`🎮 SocketService.toggleBotAssignment: sending to backend: roomId=${roomId}, playerId=${playerId}, enabled=${enabled}`);
    this.emit('toggleBotAssignment', { roomId, playerId, enabled });
  }

  makeChoice(roomId: string, playerId: string, choice: number) {
    this.emit('makeChoice', { roomId, playerId, choice });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'not_initialized';
    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected) return 'disconnected';
    return 'connecting';
  }
}

export const socketService = new SocketService();
