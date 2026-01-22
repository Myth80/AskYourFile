import 'dotenv/config'; // ⬅ loads .env first

import { spawn } from 'child_process';
import app from './app.js';
import connectDB from './config/db.js';

connectDB();

const PORT = process.env.PORT || 5000;
const PYTHON_PORT = 8000;

/* 🚀 Start Python FastAPI service */
spawn('python', ['embedding_api/app.py'], {
  env: { ...process.env, PYTHON_PORT },
  stdio: 'inherit'
});

/* Start Express server */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
