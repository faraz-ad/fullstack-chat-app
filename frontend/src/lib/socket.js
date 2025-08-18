import { io } from 'socket.io-client';

// Create a singleton socket instance
let socket;

const getSocketUrl = () => {
  if (import.meta.env.MODE === "development") {
    return 'http://localhost:5001';
  }
  // In production, use environment variable or fallback to Northflank backend
  return import.meta.env.VITE_SOCKET_URL || 'https://p01--chat-backend--krkkkkf8g4gm.code.run';
};

const initializeSocket = (user) => {
  if (!socket) {
    const socketUrl = getSocketUrl();
    
    socket = io(socketUrl, {
      path: '/socket.io/',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      forceNew: true,
      secure: import.meta.env.MODE === "production",
    });

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id);
      if (user) {
        console.log('Setting up socket with user:', user._id);
        socket.emit('setup', user);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

// Export the functions that main.jsx is trying to import
export const connectSocket = (user) => {
  try {
    return initializeSocket(user);
  } catch (error) {
    console.error('Error connecting socket:', error);
    throw error;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
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
