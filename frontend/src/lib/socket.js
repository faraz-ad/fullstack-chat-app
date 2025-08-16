import { io } from 'socket.io-client';

// Create a singleton socket instance
let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    // Use the VITE_SOCKET_URL if set, otherwise use the same origin
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: false,
      query: { userId },
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call connectSocket first.');
  }
  return socket;
};

// Socket event constants
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MESSAGE: 'message',
  GET_ONLINE_USERS: 'getOnlineUsers',
  // Add other socket events used in your app
};

// Helper function to emit socket events with error handling
export const emitSocketEvent = (event, data, callback) => {
  if (!socket) {
    console.error('Socket not connected');
    if (callback) callback({ error: 'Socket not connected' });
    return;
  }
  
  return new Promise((resolve) => {
    socket.emit(event, data, (response) => {
      if (response?.error) {
        console.error(`Socket error on ${event}:`, response.error);
      }
      if (callback) callback(response);
      resolve(response);
    });
  });
};
