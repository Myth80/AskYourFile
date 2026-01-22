import File from '../models/File.js';
import Chunk from '../models/Chunk.js';
import { parseFile } from '../utils/fileParser.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { chunkText } from '../services/ragService.js';

export const uploadFile = async (req, res) => {
  try {
    const extractedText = await parseFile(req.file);

    const newFile = await File.create({
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      content: extractedText
    });

    const chunks = chunkText(extractedText);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);

      await Chunk.create({
        fileId: newFile._id,
        text: chunk,
        embedding
      });
    }

    res.status(201).json({
      message: 'File uploaded & embedded locally',
      fileId: newFile._id,
      chunksCreated: chunks.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
