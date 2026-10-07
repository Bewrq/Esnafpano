const express = require('express');
const cors = require('cors');
const path = require('node:path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { loadEnvironment } = require('../../global/scripts/config.cjs');

// Env değişkenlerini yükle
loadEnvironment();

const app = express();

// Middleware
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(value => value.trim()),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Route'ları
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Yalnızca yerel ayarlarda belirtilen kayıtlı hesabı yönetici yap.
const ensureAdminAccount = async () => {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!adminEmail) return;
    const user = await User.findOne({ email: adminEmail });
    if (user && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log('🛡️ Yapılandırılan yönetici hesabı güncellendi.');
    } else if (user && user.role === 'admin') {
      console.log('🛡️ Yapılandırılan yönetici hesabı aktif.');
    } else {
      console.log('ADMIN_EMAIL hesabını kayıt sayfasından oluşturup API’yi yeniden başlatın.');
    }
  } catch (err) {
    console.error('Admin hesabı kontrolünde hata:', err.message);
  }
};

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, database: connected ? 'connected' : 'disconnected', message: 'EsnafPano API çalışıyor 🚀', timestamp: new Date() });
});

// Production serves the built React app and supports direct page URLs.
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Endpoint bulunamadı' }));
if (process.env.NODE_ENV === 'production') {
  const publicDir = path.resolve(__dirname, '../client/dist');
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

// Global hata yakalayıcı
app.use((err, req, res, next) => {
  console.error('API hatası:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Sunucu hatası' : (err.message || 'Sunucu hatası'),
  });
});

let server;
async function start() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET eksik. Proje kökünden npm start çalıştırın.');
  await connectDB();
  await ensureAdminAccount();
  server = app.listen(Number(process.env.PORT), process.env.HOST, () => {
    console.log(`🚀 API ${process.env.NODE_ENV} modunda ${process.env.PORT} portunda hazır.`);
  });
  server.on('error', () => { console.error('API portu açılamadı. PORT ayarını kontrol edin.'); process.exit(1); });
}
async function shutdown() {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
start().catch(async () => {
  console.error('API başlatılamadı. MongoDB erişimini ve .env ayarlarını kontrol edin.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
