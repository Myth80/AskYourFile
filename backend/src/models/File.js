import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('File', fileSchema);
