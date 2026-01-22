import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import app from './app.js';
import connectDB from './config/db.js';

connectDB();

/* 🔴 Render REQUIREMENT */
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT environment variable not set");
}

const PYTHON_PORT = 8000;

/* Correct path: backend → .. → embedding-api */
const PYTHON_APP = path.join(process.cwd(), '..', 'embedding-api', 'app.py');

/* Start Python (may still fail, but NO LONGER blocks Render) */
const python = spawn('python3', [PYTHON_APP], {
  env: { ...process.env, PYTHON_PORT },
  stdio: 'inherit'
});

python.on('error', (err) => {
  console.error('❌ Failed to start Python:', err);
});

python.on('exit', (code) => {
  console.error(`❌ Python process exited with code ${code}`);
});

/* 🔥 THIS is what Render scans for */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
