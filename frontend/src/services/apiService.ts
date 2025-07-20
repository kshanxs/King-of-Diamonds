import { SERVER_URL } from '../config/environment';

const API_BASE_URL = `${SERVER_URL}/api`;

export interface CreateRoomResponse {
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  playerId: string;
}

class ApiService {
  async createRoom(playerName: string): Promise<CreateRoomResponse> {
    try {
      console.log('Making API request to:', `${API_BASE_URL}/create-room`);
      const response = await fetch(`${API_BASE_URL}/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create room: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response data:', result);
      return result;
    } catch (error) {
      console.error('Network or parsing error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  }

  async joinRoom(roomId: string, playerName: string): Promise<JoinRoomResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, playerName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }

      return response.json();
    } catch (error) {
      console.error('Network or parsing error in joinRoom:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
