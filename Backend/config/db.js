const mongoose = require("mongoose");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("FATAL: MONGODB_URI or MONGO_URI environment variable is not set.");
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxPoolSize: process.env.NODE_ENV === "production" ? 100 : 10,
      minPoolSize: process.env.NODE_ENV === "production" ? 10 : 1,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });
    console.log("🚀 MongoDB Connected... 🚀");
    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
