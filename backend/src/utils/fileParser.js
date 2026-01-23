import fs from "fs";
import path from "path";
import * as pdfjs from "pdfjs-dist/build/pdf.mjs";

export const parseFile = async (file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  /* 📄 PDF (ESM SAFE, RENDER SAFE) */
  if (file.mimetype === "application/pdf" || ext === ".pdf") {
    const data = new Uint8Array(fs.readFileSync(filePath));

    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + "\n\n";
    }

    return text;
  }

  /* 📄 TEXT */
  if (file.mimetype.startsWith("text/") || ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(
    `Unsupported file type: ${file.mimetype} (${ext})`
  );
};
