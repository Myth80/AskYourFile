import File from "../models/File.js";
import Chunk from "../models/Chunk.js";
import { parseFile } from "../utils/fileParser.js";
import { generateEmbedding } from "../services/embeddingService.js";
import { chunkText } from "../services/ragService.js";

/* ================================
   1️⃣ UPLOAD FILE (FAST & SAFE)
   ================================ */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newFile = await File.create({
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      status: "uploaded"
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      fileId: newFile._id
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

/* ==========================================
   2️⃣ PROCESS FILE (HEAVY WORK – SEPARATE)
   ========================================== */
export const processFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const extractedText = await parseFile({
      path: file.filePath,
      originalname: file.originalName,
      mimetype: file.fileType
    });

    const chunks = chunkText(extractedText);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      await Chunk.create({
        fileId: file._id,
        text: chunk,
        embedding
      });
    }

    file.status = "processed";
    await file.save();

    res.status(200).json({
      message: "File processed successfully",
      chunksCreated: chunks.length
    });

  } catch (err) {
  console.error("❌ Processing error:", err.message);

  return res.status(503).json({
    error: "Embedding service is warming up. Please retry in a moment."
  });
}

};

