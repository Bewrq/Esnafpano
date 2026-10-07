const path = require('node:path');
const { spawn } = require('node:child_process');
const { root } = require('./config.cjs');

// A development NODE_ENV in .env must not ship React's development build.
const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
const child = spawn(process.execPath, [vite, 'build'], {
  cwd: path.join(root, 'app', 'client'),
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
  windowsHide: true,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
