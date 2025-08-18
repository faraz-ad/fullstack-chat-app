import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Increase payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  /https?:\/\/fullstack-chat-app(-\w+)*\.vercel\.app$/, // Match any Vercel preview URL
  'https://fullstack-chat-app.vercel.app'
];

const isDevelopment = process.env.NODE_ENV !== 'production';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin && isDevelopment) {
      return callback(null, true);
    }

    // Check if the origin matches any allowed patterns
    if (isDevelopment || !origin || 
        allowedOrigins.some(pattern => 
          pattern instanceof RegExp 
            ? pattern.test(origin) 
            : pattern === origin
        )
    ) {
      console.log('Allowed origin:', origin);
      return callback(null, true);
    }
    
    console.log('Blocked CORS for origin:', origin);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'X-CSRF-Token',
    'X-Requested-With',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Api-Version'
  ],
  exposedHeaders: [
    'set-cookie',
    'Content-Length',
    'X-Foo',
    'X-Bar'
  ],
  optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false
};

// Apply CORS with options
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
