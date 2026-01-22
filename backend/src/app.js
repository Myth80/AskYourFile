import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fileRoutes from './routes/fileRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/files', fileRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AskYourFile backend running' });
});

/* ================================
   🔒 GLOBAL ERROR HANDLER (REQUIRED)
   ================================ */
app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer error:", err.message);
    return res.status(400).json({
      error: err.message || "File upload error"
    });
  }

  // Any other error
  if (err) {
    console.error("❌ Unhandled error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }

  next();
});

export default app;
