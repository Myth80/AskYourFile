import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { uploadFile, processFile } from "../controllers/fileController.js";

const router = express.Router();

/* Ensure uploads directory exists */
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/upload", upload.single("file"), uploadFile);
router.post("/process/:fileId", processFile);

export default router;
