import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    embedding: {
      type: [Number],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Chunk', chunkSchema);
