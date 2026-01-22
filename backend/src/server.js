import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import app from './app.js';
import connectDB from './config/db.js';

connectDB();

const PORT = process.env.PORT || 5000;
const PYTHON_PORT = 8000;

/* Absolute path to Python app */
const PYTHON_APP = path.join(process.cwd(), 'embedding-api/app.py');

/* 🔥 Use system Python */
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

/* Start Express server */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
