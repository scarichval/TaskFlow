const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config(); // Loads environment variables from .env file

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1); // Exit with failure
    }
  };
  
  module.exports = connectDB;
  