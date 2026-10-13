const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-classroom';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB not connected at ${process.env.MONGODB_URI}: ${error.message}`);
    console.warn(`💡 Tip: Start local MongoDB ('mongod') or set MONGODB_URI to a MongoDB Atlas connection string in server/.env`);
    console.warn(`🚀 Starting Express API server regardless so endpoints are live on port ${process.env.PORT || 5000}...`);
  }
};

module.exports = connectDB;
