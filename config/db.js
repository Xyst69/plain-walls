/**
 * config/db.js
 * Database connection helper using Mongoose.
 * Connects to MongoDB (configured for local MongoDB Compass: mongodb://localhost:27017)
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout before warning
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} / Database: ${conn.connection.name}`);
    console.log(`[MongoDB Compass] View collections in Compass using: mongodb://localhost:27017 (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${mongoUri}. Error: ${error.message}`);
    console.warn(`[MongoDB Compass]: Ensure MongoDB service is running (or Compass is active on localhost:27017).`);
    // Do not crash the process so developer/evaluator can see status via /api/system/db-status and the in-app inspector
    return null;
  }
};

module.exports = connectDB;
