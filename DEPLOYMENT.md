# Chat Application Deployment Guide

This guide provides step-by-step instructions for deploying both the frontend and backend of the chat application.

## Prerequisites

1. Node.js (v16 or later)
2. npm or yarn
3. MongoDB Atlas account (for database)
4. Cloudinary account (for image storage)
5. A hosting provider (e.g., Vercel, Netlify for frontend; Render, Railway, or Heroku for backend)

## Backend Deployment

### 1. Set Up Environment Variables

In your hosting provider's dashboard, set the following environment variables:

```
# Server Configuration
PORT=5001
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret

# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL for CORS (without trailing slash)
FRONTEND_URL=https://your-frontend-url.com
```

### 2. Deploy Backend

You can deploy the backend to services like Render, Railway, or Heroku. Here's an example for Render:

1. Push your code to a GitHub repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the following build settings:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
5. Add the environment variables in the Render dashboard
6. Deploy

## Frontend Deployment

### 1. Set Up Environment Variables

In your frontend hosting provider's dashboard, set these variables:

```
# API Configuration
VITE_API_BASE_URL=https://your-backend-api-url.com
VITE_SOCKET_URL=wss://your-backend-api-url.com
```

### 2. Deploy Frontend

You can deploy the frontend to Vercel, Netlify, or any static hosting service. Here's an example for Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set the environment variables in the Vercel project settings
4. Deploy

## Environment Variables Reference

### Backend
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Set to 'production' in production
- `JWT_SECRET`: Secret key for JWT tokens
- `MONGODB_URI`: MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `FRONTEND_URL`: URL of your frontend (for CORS)

### Frontend
- `VITE_API_BASE_URL`: Full URL to your backend API (e.g., https://api.yourdomain.com)
- `VITE_SOCKET_URL`: WebSocket URL for real-time features (e.g., wss://api.yourdomain.com)

## Post-Deployment

1. Test all features including:
   - User registration and login
   - Sending and receiving messages
   - Image uploads in chat
   - Profile picture updates

2. Set up monitoring and error tracking (e.g., Sentry, LogRocket)

3. Configure a custom domain and SSL certificate

## Troubleshooting

- **CORS Errors**: 
  - Ensure `FRONTEND_URL` in the backend matches your frontend's URL exactly
  - Check for protocol mismatches (http vs https)
  - Verify no trailing slashes in URLs

- **Database Connection**:
  - Verify your MongoDB Atlas IP whitelist
  - Check connection string format
  - Ensure network access is properly configured

- **File Uploads**:
  - Verify Cloudinary credentials
  - Check file size limits (configured to 50MB in the backend)
  - Ensure proper CORS settings

- **WebSocket Issues**:
  - Ensure your hosting provider supports WebSockets
  - Check for proxy configuration if using a CDN
  - Verify the WebSocket URL is correct (wss:// for production)

## Local Development

1. Copy `.env.example` to `.env` in both frontend and backend directories
2. Update the values for local development
3. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (in a new terminal)
   cd frontend
   npm install
   npm run dev
   ```
