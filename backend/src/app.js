import express from "express";
import cors from "cors";
import multer from "multer";
import fileRoutes from "./routes/fileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

/* 🔥 CORS */
app.use(
  cors({
    origin: "https://askyourfile-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* 🔥 REQUIRED FOR EXPRESS 5 */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "AskYourFile backend running" });
});

/* 🔒 GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    console.error("❌ Unhandled error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
  next();
});

export default app;
