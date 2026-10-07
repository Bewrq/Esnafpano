const mongoose = require('mongoose');
const { loadEnvironment, openDatabase } = require('./config.cjs');

async function main() {
  loadEnvironment({ create: true });
  if (process.env.NODE_ENV === 'production') throw new Error('Demo verileri üretim ortamında oluşturulmaz.');
  if (process.env.MONGODB_URI?.trim() && !process.argv.includes('--allow-external')) {
    throw new Error('Harici veritabanına demo eklemek için: npm run seed -- --allow-external');
  }
  const database = await openDatabase({ reuse: true });
  try {
    await mongoose.connect(database.uri, { serverSelectionTimeoutMS: 10000 });
    await require('../../app/server/seed').seedData();
  } finally {
    await mongoose.disconnect();
    await database.stop();
  }
}

main().catch(error => { console.error(`Demo kurulumu başarısız: ${error.message}`); process.exitCode = 1; });
