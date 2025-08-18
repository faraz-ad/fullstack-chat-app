import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          // User is not authenticated, this is normal for new visitors
          console.log("User not authenticated, redirecting to login");
        } else {
          console.error("Auth check failed:", error.response.data);
        }
      } else if (error.request) {
        // Request was made but no response (CORS/Network error)
        console.error("Auth check network error:", error.request);
      } else {
        // Something else happened
        console.error("Auth check error:", error.message);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
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
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Set the user data immediately after successful login
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      // Wait a moment for the cookie to be set, then connect socket
      setTimeout(() => {
        get().connectSocket();
      }, 100);
      
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        // Request was made but no response (CORS/Network error)
        toast.error("Network error. Please check your connection or try again later.");
        console.error("Network error:", error.request);
      } else {
        // Something else happened
        toast.error("An unexpected error occurred");
        console.error("Login error:", error.message);
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
      // Always clear local state and disconnect socket
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
      
      // Redirect to login page
      window.location.href = '/login';
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
