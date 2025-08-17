import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5001/api" 
    : "https://p01--chat-backend--krkkkkf8g4gm.code.run/api",
  withCredentials: true,
});
