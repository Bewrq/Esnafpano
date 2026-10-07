const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '../..');
const configDir = path.join(root, 'global', 'config');
const dataDir = path.join(root, 'global', 'data');
const runtimeFile = path.join(dataDir, 'local-mongodb.json');

function loadEnvironment({ create = false } = {}) {
  const envFile = path.join(configDir, '.env');
  if (create && !fs.existsSync(envFile)) {
    const template = fs.readFileSync(path.join(configDir, '.env.example'), 'utf8');
    fs.writeFileSync(envFile, template.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`), { flag: 'wx', mode: 0o600 });
    console.log('global/config/.env oluşturuldu; benzersiz oturum anahtarı hazır.');
  }
  dotenv.config({ path: envFile });
  process.env.PORT ||= '5000';
  process.env.CLIENT_PORT ||= '5173';
  process.env.HOST ||= '127.0.0.1';
  process.env.CLIENT_HOST ||= '127.0.0.1';
  process.env.JWT_EXPIRE ||= '30d';
  process.env.NODE_ENV ||= 'development';
}

function isRunning(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}

async function openDatabase({ reuse = false, production = false } = {}) {
  if (process.env.MONGODB_URI?.trim()) return { uri: process.env.MONGODB_URI, stop: async () => {} };
  if (production) throw new Error('Üretim için global/config/.env içinde MONGODB_URI ayarlayın.');
  if (fs.existsSync(runtimeFile)) {
    const runtime = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
    if (isRunning(runtime.pid)) {
      if (reuse) return { uri: runtime.uri, stop: async () => {} };
      throw new Error('Yerel veritabanı zaten çalışıyor. Açık npm start işlemini kapatın.');
    }
  }
  const { MongoMemoryServer } = require('mongodb-memory-server-core');
  const dbPath = path.join(dataDir, 'mongodb');
  fs.mkdirSync(dbPath, { recursive: true });
  console.log('Yerel MongoDB hazırlanıyor (ilk açılışta MongoDB indirilir)...');
  const mongo = await MongoMemoryServer.create({
    binary: { version: '7.0.24', downloadDir: path.join(dataDir, 'mongodb-binaries') },
    instance: { dbPath, storageEngine: 'wiredTiger', ip: '127.0.0.1' },
  });
  const uri = mongo.getUri('esnafpano');
  fs.writeFileSync(runtimeFile, JSON.stringify({ pid: process.pid, uri }), { mode: 0o600 });
  console.log('Yerel veritabanı hazır. Veriler global/data/mongodb içinde saklanır.');
  return {
    uri,
    async stop() {
      await mongo.stop({ doCleanup: false, force: false });
      if (fs.existsSync(runtimeFile)) fs.unlinkSync(runtimeFile);
    },
  };
}

module.exports = { root, loadEnvironment, openDatabase };
