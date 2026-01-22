import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

connectDB();

/* Render requires PORT */
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT environment variable not set");
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
