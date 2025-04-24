const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.CONNECTION_URL;

const connectDB = async () => {
   try {
       await mongoose.connect(mongoURI);
       console.log('MongoDB connected successfully');
   } catch (err) {
       console.error('Database connection failed:', err);
   }
};

module.exports = connectDB