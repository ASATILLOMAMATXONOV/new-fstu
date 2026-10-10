import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const watchRoot = path.join(projectRoot, 'src');
const serverEntry = path.join(watchRoot, 'server.js');
const scanIntervalMs = 1000;

let child = null;
let restarting = false;
let lastSignature = '';

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.name !== '.DS_Store')
      .map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return walkFiles(fullPath);
        }
        return [fullPath];
      }),
  );

  return files.flat();
}

async function buildSignature() {
  const files = await walkFiles(watchRoot);
  const stats = await Promise.all(
    files.map(async (filePath) => {
      const fileStat = await stat(filePath);
      return `${filePath}:${fileStat.mtimeMs}:${fileStat.size}`;
    }),
  );

  return stats.sort().join('|');
}

function startServer() {
  child = spawn(process.execPath, [serverEntry], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    child = null;
    if (restarting) {
      restarting = false;
      startServer();
      return;
    }

    if (signal) {
      process.exit(0);
      return;
    }

    if (code && code !== 0) {
      console.log(`Server exited with code ${code}. Waiting for file changes...`);
    }
  });
}

function stopServerForRestart() {
  if (!child) {
    startServer();
    return;
  }

  restarting = true;
  child.kill('SIGTERM');
}

async function checkForChanges() {
  try {
    const signature = await buildSignature();
    if (!lastSignature) {
      lastSignature = signature;
      return;
    }

    if (signature !== lastSignature) {
      lastSignature = signature;
      console.log('Changes detected. Restarting backend...');
      stopServerForRestart();
    }
  } catch (error) {
    console.error('Watcher scan failed:', error);
  }
}

function shutdown(signal) {
  if (!child) {
    process.exit(0);
    return;
  }

  child.once('exit', () => process.exit(0));
  child.kill(signal);
}

lastSignature = await buildSignature();
startServer();
const interval = setInterval(checkForChanges, scanIntervalMs);

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('exit', () => clearInterval(interval));
