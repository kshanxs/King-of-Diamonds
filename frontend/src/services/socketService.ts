import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config/environment';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = SERVER_URL;

  connect(): Socket {
    if (!this.socket) {
      console.log(`🔗 Connecting to server: ${this.serverUrl}`);
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
        console.log('✅ Connected to server');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🚫 Connection error:', error);
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

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinRoom(roomId: string, playerId: string) {
    this.emit('joinRoom', { roomId, playerId });
  }

  startGame(roomId: string, playerId: string) {
    this.emit('startGame', { roomId, playerId });
  }

  makeChoice(roomId: string, playerId: string, choice: number) {
    this.emit('makeChoice', { roomId, playerId, choice });
  }
}

export const socketService = new SocketService();
