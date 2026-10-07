const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI eksik. Proje kökünden npm start çalıştırın.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB bağlantısı hazır.');
};

module.exports = connectDB;
