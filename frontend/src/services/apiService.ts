const API_BASE_URL = 'http://localhost:5001/api';

export interface CreateRoomResponse {
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  playerId: string;
}

class ApiService {
  async createRoom(playerName: string): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_BASE_URL}/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  }

  async joinRoom(roomId: string, playerName: string): Promise<JoinRoomResponse> {
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
  }
}

export const apiService = new ApiService();
