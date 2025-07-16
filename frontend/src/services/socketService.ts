import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:5001';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl);
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
