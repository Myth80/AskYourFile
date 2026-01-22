import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["uploaded", "processed"],
      default: "uploaded"
    }
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);
