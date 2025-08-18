import dotenv from "dotenv";
import { connectDB } from "./src/lib/db.js";

dotenv.config();

console.log("Testing backend connection...");
console.log("Environment variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");

// Test MongoDB connection
console.log("\nTesting MongoDB connection...");
try {
  await connectDB();
  console.log("✅ MongoDB connection successful");
} catch (error) {
  console.error("❌ MongoDB connection failed:", error.message);
}

console.log("\nBackend test completed.");
