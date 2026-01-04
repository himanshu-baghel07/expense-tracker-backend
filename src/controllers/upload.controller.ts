import { Request, Response } from "express";
import fs from "fs";
import { deleteImage, uploadImage } from "../services/upload.service.js";

export const uploadImageController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("Upload request received");
    const file = (req as any).file;

    console.log(
      "File received:",
      file
        ? {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
          }
        : "No file"
    );

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Starting Cloudinary upload...");
    const result = await uploadImage(file);
    console.log("Cloudinary upload successful");

    // Delete file from local storage after uploading to Cloudinary
    fs.unlinkSync(file.path);

    return res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Upload controller error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteImageController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    const result = await deleteImage(publicId);

    return res.status(200).json({
      message: "Image deleted successfully",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
