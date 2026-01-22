import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const parseFile = async (file) => {
  const filePath = file.path;

  // PDF files
  if (file.mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    return pdfData.text;
  }

  // Plain text files
  if (file.mimetype === "text/plain") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error("Unsupported file type");
};
