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
  skipAuthCheck: false, // Re-introduced and refined

  checkAuth: async () => {
    // Skip auth check if flag is set (e.g., after logout)
    if (get().skipAuthCheck) {
      // Wait a moment before re-enabling auth checks
      setTimeout(() => {
        set({ skipAuthCheck: false });
      }, 500);
      set({ isCheckingAuth: false });
      return;
    }
    
    try {
      // Set auth user to null first to allow navigation (latest attempt)
      set({ authUser: null, isCheckingAuth: false });
      
      // Try to check auth in background (non-blocking)
      try {
        const res = await axiosInstance.get("/auth/check");
        console.log("Auth check successful:", res.data);
        set({ authUser: res.data });
        get().connectSocket();
      } catch (error) {
        console.log("Error in checkAuth:", error);
        if (error.response) {
          if (error.response.status === 401) {
            console.log("User not authenticated, this is normal");
          } else {
            console.error("Auth check failed:", error.response.data);
          }
        } else if (error.request) {
          console.error("Auth check network error:", error.request);
        } else {
          console.error("Auth check error:", error.message);
        }
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
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      
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
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login successful:", res.data);
      
      // Set the user data immediately after successful login
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // Wait a moment for the cookie to be set, then connect socket
      setTimeout(() => {
        get().connectSocket();
      }, 100);
      
      // Navigate to home page after successful login
      console.log("Redirecting to home page...");
      window.location.href = '/';
      
    } catch (error) {
      console.error("Login error:", error);
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        // Request was made but no response (CORS/Network error)
        toast.error("Network error. Please check your connection or try again later.");
      } else {
        // Something else happened
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error("Logout error:", error);
    } finally {
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
        get().socket.disconnect();
      }
      
      toast.success("Logged out successfully");
      
      // Clear any stored tokens or user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Let React Router handle the navigation
      // The AuthContext will redirect to login automatically
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

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
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
