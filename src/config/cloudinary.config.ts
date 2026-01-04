import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

// Test configuration
if (!process.env.CLOUDINARY_API_KEY) {
  console.error("CLOUDINARY_API_KEY is not set in environment variables");
}

export default cloudinary;
