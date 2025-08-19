import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import http from "http";
import express from "express";

export const app = express();
export const server = http.createServer(app);

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://fullstack-chat-app.vercel.app',
      'https://fullstack-chat-app-lake-eight.vercel.app', // Your specific Vercel URL
      'https://fullstack-chat-app-git-main-faraz-ahmads-projects-ba6bcef3.vercel.app'
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked socket.io origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: {
    name: 'io',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Authenticate user via JWT from cookie or auth header passed in handshake
  let userId = null;
  try {
    const { authorization } = socket.handshake.auth || {};
    const tokenFromAuth = authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : null;
    const tokenFromCookie = socket.request?.headers?.cookie?.split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('jwt='))?.split('=')[1];

    const token = tokenFromAuth || tokenFromCookie;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded?.userId || null;
    }
  } catch (e) {
    console.log('Socket auth failed:', e.message);
  }

  // Fallback to query userId only if JWT absent (legacy)
  if (!userId) {
    userId = socket.handshake.query.userId;
  }

  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Export the socket.io instance for use in other files
export { io };
