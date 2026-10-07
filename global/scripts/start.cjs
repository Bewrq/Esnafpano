const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { root, loadEnvironment, openDatabase } = require('./config.cjs');

const production = process.argv.includes('--production');
const children = [];
let database;
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  console.log('\nEsnafPano kapatılıyor...');
  await Promise.all(children.map(child => new Promise(resolve => {
    if (child.exitCode !== null || !child.pid) return resolve();
    child.once('exit', resolve);
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }).once('close', resolve);
    } else {
      child.kill('SIGTERM');
    }
    setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 5000).unref();
  })));
  if (database) await database.stop();
  process.exit(code);
}

function launch(args, cwd) {
  const child = spawn(process.execPath, args, { cwd, env: process.env, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); void stop(1); });
  child.on('exit', (code, signal) => { if (!stopping) { console.error(`Uygulama işlemi kapandı (${code ?? signal}).`); void stop(code || 1); } });
  return child;
}

async function checkPort(value, host, label) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`${label} geçerli bir port olmalı.`);
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`${label} ${port} portu kullanılıyor. global/config/.env dosyasından portu değiştirin.`)));
    probe.listen(port, host, () => probe.close(resolve));
  });
}

async function waitForApi() {
  for (let attempt = 0; attempt < 60 && !stopping; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${process.env.PORT}/api/health`, { signal: AbortSignal.timeout(1500) });
      if (response.ok && (await response.json()).database === 'connected') return;
    } catch { /* Startup in progress. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('API başlatılamadı. Terminaldeki veritabanı ve sunucu mesajlarını kontrol edin.');
}

async function main() {
  loadEnvironment({ create: !production });
  if (production) process.env.NODE_ENV = 'production';
  if (!process.env.JWT_SECRET) throw new Error('global/config/.env dosyasına JWT_SECRET ekleyin.');
  if (production && process.env.JWT_SECRET.length < 32) throw new Error('Üretimde JWT_SECRET en az 32 karakter olmalı.');
  if (production && !fs.existsSync(path.join(root, 'app', 'client', 'dist', 'index.html'))) throw new Error('Önce npm run build çalıştırın.');
  await checkPort(process.env.PORT, process.env.HOST, 'API');
  if (!production) await checkPort(process.env.CLIENT_PORT, process.env.CLIENT_HOST, 'Arayüz');
  database = await openDatabase({ production });
  process.env.MONGODB_URI = database.uri;
  if (stopping) return database.stop();
  if (production) launch(['app/server/server.js'], root);
  else launch(['--watch', 'app/server/server.js'], root);
  await waitForApi();
  if (stopping) return;
  if (!production) {
    const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
    launch([vite, '--host', process.env.CLIENT_HOST, '--port', process.env.CLIENT_PORT, '--strictPort'], path.join(root, 'app', 'client'));
  }
  console.log(`\nEsnafPano: http://localhost:${production ? process.env.PORT : process.env.CLIENT_PORT}`);
  console.log(`API: http://localhost:${process.env.PORT}/api/health`);
  console.log('Durdurmak için Ctrl+C. Örnek veriler için başka terminalde: npm run seed\n');
}

process.on('SIGINT', () => { void stop(); });
process.on('SIGTERM', () => { void stop(); });
main().catch(error => { console.error(`Başlatma hatası: ${error.message}`); void stop(1); });
