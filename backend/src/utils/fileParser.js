import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const parseFile = async (file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  /* 📄 PDF */
  if (
    file.mimetype === "application/pdf" ||
    ext === ".pdf"
  ) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
  }

  /* 📄 TEXT (robust handling) */
  if (
    file.mimetype.startsWith("text/") ||
    ext === ".txt"
  ) {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(
    `Unsupported file type: ${file.mimetype} (${ext})`
  );
};
