import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { connectSocket, disconnectSocket } from "./lib/socket";

// Main App Wrapper with Socket Management
const AppWithSocket = () => {
  // Initialize socket connection when component mounts
  useEffect(() => {
    // Connect to socket when component mounts
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      // Only connect if user is authenticated
      connectSocket(userId);
    }

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
};

// Render the app
createRoot(document.getElementById("root")).render(<AppWithSocket />);
