import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config.js";
import { MulterFile } from "../types/index.js";

export const uploadImage = async (
  file: MulterFile
): Promise<UploadApiResponse> => {
  try {
    console.log("Uploading file:", file.path);
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "expense-tracker",
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    });
    return result;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Image upload failed: ${error.message || JSON.stringify(error)}`
    );
  }
};

export const deleteImage = async (id: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(id);
    return result;
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(
      `Image deletion failed: ${error.message || JSON.stringify(error)}`
    );
  }
};
