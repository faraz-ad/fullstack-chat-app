import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://p01--chat-backend--krkkkkf8g4gm.code.run";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  skipAuthCheck: false,

  // Initialize auth state from localStorage or cookies
  initializeAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ authUser: user, isCheckingAuth: false });
        get().connectSocket(token);
        return;
      }

      // If no stored user, check with backend
      await get().checkAuth();
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  checkAuth: async () => {
    if (get().skipAuthCheck) {
      setTimeout(() => {
        set({ skipAuthCheck: false });
      }, 500);
      set({ isCheckingAuth: false });
      return;
    }
    
    try {
      set({ isCheckingAuth: false });
      
      try {
        const res = await axiosInstance.get("/auth/check");
        console.log("Auth check successful:", res.data);
        const user = res.data;
        
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        set({ authUser: user });
        get().connectSocket(localStorage.getItem('token'));
      } catch (error) {
        console.log("Error in checkAuth:", error);
        if (error.response) {
          if (error.response.status === 401) {
            console.log("User not authenticated, this is normal");
            localStorage.removeItem('user');
          } else {
            console.error("Auth check failed:", error.response.data);
          }
        } else if (error.request) {
          console.error("Auth check network error:", error.request);
        } else {
          console.error("Auth check error:", error.message);
        }
        set({ authUser: null });
      }
    } catch (error) {
      console.error("Unexpected error in checkAuth:", error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    console.log("Starting signup process...");
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("Signup successful:", res.data);
      
      const { token, ...user } = res.data;
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
      set({ authUser: user });
      
      toast.success("Account created successfully");
      get().connectSocket(token);
      
      // Navigate to home page after successful signup
      console.log("Redirecting to home page...");
      window.location.href = '/';
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Signup failed");
      } else if (error.request) {
        toast.error("Network error. Please check your connection or try again later.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    console.log("Starting login process...");
    set({ isLoggingIn: true });
    try {
      console.log("Making login request to:", axiosInstance.defaults.baseURL);
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login successful:", res.data);
      
      const { token, ...user } = res.data;
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
      set({ authUser: user });
      
      toast.success("Logged in successfully");

      // Wait a moment for the cookie to be set, then connect socket
      setTimeout(() => {
        get().connectSocket(token || localStorage.getItem('token'));
      }, 100);
      
      // Navigate to home page after successful login
      console.log("Redirecting to home page...");
      window.location.href = '/';
      
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
        toast.error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error. Please check your connection or try again later.");
      } else {
        console.error("Request setup error:", error.message);
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    console.log("Starting logout process...");
    try {
      await axiosInstance.post("/auth/logout");
      console.log("Backend logout successful");
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error("Logout error:", error);
    } finally {
      console.log("Clearing local state and localStorage...");
      
      // Clear local state and disconnect socket
      set({ 
        authUser: null, 
        isCheckingAuth: false,
        onlineUsers: [],
        socket: null,
        skipAuthCheck: true // Skip next auth check
      });
      
      // Disconnect socket if it exists
      if (get().socket?.connected) {
        console.log("Disconnecting socket...");
        get().socket.disconnect();
      }
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      console.log("Logout complete, authUser should now be null");
      toast.success("Logged out successfully");
      
      // Let React Router handle the navigation instead of window.location.href
      // The App.jsx will automatically redirect to /login when authUser becomes null
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Profile update failed");
      } else if (error.request) {
        toast.error("Network error. Please check your connection or try again later.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: (token) => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      auth: token ? { authorization: `Bearer ${token}` } : undefined,
      query: token ? undefined : { userId: authUser._id },
      withCredentials: true,
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
