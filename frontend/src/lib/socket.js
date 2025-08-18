import { io } from 'socket.io-client';

// Create a singleton socket instance
let socket;

const initializeSocket = (user) => {
  if (!socket) {
    const socketUrl = import.meta.env.MODE === 'development'
      ? 'http://localhost:5001'
      : 'https://p01--chat-backend--krkkkkf8g4gm.code.run';
      
    socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (user) {
        socket.emit('setup', user);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

// Export the functions that main.jsx is trying to import
export const connectSocket = (user) => {
  return initializeSocket(user);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

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
