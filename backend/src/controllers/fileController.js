import File from "../models/File.js";
import Chunk from "../models/Chunk.js";
import { parseFile } from "../utils/fileParser.js";
import { embedText } from "../services/geminiService.js";

/* ================================
   1️⃣ UPLOAD FILE
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
      status: "uploaded",
    });

    res.status(201).json({
      message: "File uploaded successfully",
      fileId: newFile._id,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

/* ================================
   2️⃣ PROCESS FILE
   ================================ */
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
      mimetype: file.fileType,
    });

    const chunks = extractedText
      .split("\n")
      .filter(Boolean)
      .slice(0, 50); // safe limit for free tier

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);

      await Chunk.create({
        fileId: file._id,
        text: chunk,
        embedding,
      });
    }

    file.status = "processed";
    await file.save();

    res.json({
      message: "File processed successfully",
      chunksCreated: chunks.length,
    });
  } catch (err) {
    console.error("❌ Processing error:", err);
    res.status(500).json({ error: "File processing failed" });
  }
};
