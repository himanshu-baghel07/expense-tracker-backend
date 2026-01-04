import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/database.config.js";

dotenv.config();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp folder for uploads
const tempDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const PORT: number = Number(process.env.PORT) || 5001;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is listening on Port: ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}
