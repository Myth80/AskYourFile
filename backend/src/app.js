import express from 'express';
import cors from 'cors';
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

export default app;
