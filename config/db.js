/**
 * config/db.js
 * Database connection helper using Mongoose
 * Connects to MongoDB using the MONGO_URI specified in .env
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plain_walls';
    
    const conn = await mongoose.connect(mongoUri);

    console.log(`[MongoDB] Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Exit process with failure if DB connection cannot be established
    process.exit(1);
  }
};

module.exports = connectDB;
