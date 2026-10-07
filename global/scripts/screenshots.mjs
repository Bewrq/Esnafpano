import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'docs', 'screenshots');
let mongo, server, browser, tempDir;
const browserErrors = [];

const freePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => { const port = probe.address().port; probe.close(() => resolve(port)); });
});

async function build() {
  const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [vite, 'build'], {
      cwd: path.join(root, 'app', 'client'), stdio: 'inherit', windowsHide: true,
      env: { ...process.env, NODE_ENV: 'production', VITE_API_BASE_URL: '' },
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('Arayüz derlenemedi.')));
  });
}

async function cleanup() {
  if (browser) await browser.close();
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await exited;
  }
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (tempDir) {
    const target = path.resolve(tempDir);
    if (path.dirname(target) !== path.resolve(os.tmpdir()) || !path.basename(target).startsWith('esnafpano-screenshots-')) throw new Error('Geçici dizin sınırları geçersiz.');
    await fs.rm(target, { recursive: true, force: true });
  }
}

async function main() {
  await build();
  await fs.mkdir(output, { recursive: true });
  // An isolated disposable database prevents private local records entering GitHub images.
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'esnafpano-screenshots-'));
  mongo = await MongoMemoryServer.create({
    binary: { version: '7.0.24', downloadDir: path.join(root, 'global', 'data', 'mongodb-binaries') },
    instance: { dbPath: tempDir, storageEngine: 'wiredTiger', ip: '127.0.0.1' },
  });
  const uri = mongo.getUri('esnafpano_documentation');
  await mongoose.connect(uri);
  await require('../../app/server/seed.js').seedData();
  const Listing = require('../../app/server/models/Listing.js');
  const User = require('../../app/server/models/User.js');
  await Listing.init();
  const listing = await Listing.findOne({ category: 'Dükkan Devir/Kiralama', isFeatured: true });
  const seller = await User.findOne({ email: 'esnaf@esnafpano.com' });
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['app/server/server.js'], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, MONGODB_URI: uri, JWT_SECRET: crypto.randomBytes(48).toString('hex'), JWT_EXPIRE: '1h', PORT: String(port), HOST: '127.0.0.1', NODE_ENV: 'production', ADMIN_EMAIL: '' },
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(`${baseUrl}/api/health`)).ok) break; } catch { /* Startup. */ }
    if (attempt === 59) throw new Error('Dokümantasyon sunucusu açılamadı.');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  try { browser = await chromium.launch({ channel: 'chrome', headless: true }); }
  catch { browser = await chromium.launch({ headless: true }); }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, locale: 'tr-TR', timezoneId: 'Europe/Istanbul' });
  await context.addInitScript(() => localStorage.setItem('esnafpano_location_prompt', 'dismissed'));
  const page = await context.newPage();
  page.on('pageerror', error => browserErrors.push(error.message));

  async function capture(name, url, ready) {
    if (name === '01-ana-sayfa') await page.setViewportSize({ width: 1440, height: 1400 });
    else await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'domcontentloaded' });
    if (ready) await page.locator(ready).first().waitFor({ timeout: 20000 });
    // Scroll through the page so lazy-loaded photos appear in full-page captures.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 800) {
      await page.evaluate(position => window.scrollTo(0, position), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.complete ? null : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 15000);
      })));
    });
    await Promise.all(page.frames().slice(1).map(frame => frame.waitForLoadState('load', { timeout: 15000 }).catch(() => {})));
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: name !== '01-ana-sayfa', animations: 'disabled' });
    console.log(`Ekran görüntüsü: ${name}.png`);
  }

  async function login(email) {
    await page.goto(`${baseUrl}/giris`);
    await page.locator('#login-email-input').fill(email);
    await page.locator('#login-password-input').fill('password123');
    await page.locator('#login-submit-btn').click();
    await page.waitForURL(`${baseUrl}/`);
  }

  await capture('01-ana-sayfa', '/', `a[href="/ilan/${listing._id}"]`);
  await capture('02-ilan-detayi', `/ilan/${listing._id}`, 'h1');
  await capture('03-giris', '/giris', '#login-submit-btn');
  await capture('04-kayit', '/kayit', 'form');
  await login('esnaf@esnafpano.com');
  await capture('05-ilan-olustur', '/ilan-ver', '#create-city-select');
  await page.getByRole('button', { name: 'Dükkan & İşletme Tanıtımı', exact: true }).click();
  await page.locator('#create-city-select').selectOption('İstanbul');
  await page.locator('#create-district-input').fill('Kadıköy');
  await page.locator('#next-step-btn').click();
  await page.getByText('İşletme & Dükkan Tanıtım Detayları', { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, '06-isletme-detaylari.png'), fullPage: true, animations: 'disabled' });
  console.log('Ekran görüntüsü: 06-isletme-detaylari.png');
  await capture('07-ilanlarim', '/ilanlarim', `a[href="/ilan/${listing._id}"]`);
  await capture('08-magaza', `/magaza/${seller._id}`, `a[href="/ilan/${listing._id}"]`);
  await capture('09-mesajlar', '/mesajlar', 'input[placeholder="Mesajınızı yazın..."]');
  await context.clearCookies();
  await page.evaluate(() => { localStorage.removeItem('esnafpano_token'); localStorage.removeItem('esnafpano_user'); });
  await login('admin@esnafpano.example');
  await capture('10-yonetici-paneli', '/admin', 'h1');
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR' });
  await mobile.addInitScript(() => localStorage.setItem('esnafpano_location_prompt', 'dismissed'));
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl);
  await mobilePage.locator(`a[href="/ilan/${listing._id}"]`).first().waitFor();
  await mobilePage.evaluate(() => document.fonts.ready);
  await mobilePage.screenshot({ path: path.join(output, '11-mobil.png'), fullPage: false, animations: 'disabled' });
  console.log('Ekran görüntüsü: 11-mobil.png');
  if (browserErrors.length) throw new Error(`Tarayıcı hataları: ${browserErrors.join('; ')}`);
  console.log('11 gerçek ekran görüntüsü hazır. Yerel veritabanınız değiştirilmedi.');
}

try { await main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await cleanup(); }
