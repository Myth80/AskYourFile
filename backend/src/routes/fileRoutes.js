import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { uploadFile } from '../controllers/fileController.js';

const router = express.Router();

/* ✅ Ensure uploads directory exists (Render-safe) */
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ✅ Configure multer with existing directory */
const upload = multer({
  dest: uploadDir
});

router.post('/upload', upload.single('file'), uploadFile);

export default router;
