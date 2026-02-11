import fs from "fs";

import User from "../models/user.model.js";
import {
  GetProfileDetailsInput,
  MulterFile,
  UpdateProfileInput,
  UserResponse,
} from "../types/index.js";
import { deleteImage, uploadImage } from "./upload.service.js";

export const getProfileDetails = async (
  data: GetProfileDetailsInput,
): Promise<UserResponse> => {
  try {
    const user = await User.findById(data.id).select("-password");

    if (!user) {
      return {
        success: false,
        message: "Invalid User",
      };
    }

    return {
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error fetching profile details:", error);
    return {
      success: false,
      message: "Failed to retrieve profile",
    };
  }
};

export const updateProfile = async (
  data: UpdateProfileInput,
  file?: MulterFile,
): Promise<UserResponse> => {
  try {
    const user = await User.findById(data.id);

    if (!user) {
      // Clean up uploaded file if user not found
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update fields if provided
    if (data.name) user.name = data.name;

    // Ensure profile object exists (should exist by default, but safety first)
    if (!user.profile) {
      user.profile = {
        avatar: null,
        currency: "INR",
        monthlyBudget: null,
      };
    }

    if (data.currency) user.profile.currency = data.currency;
    if (data.monthlyBudget !== undefined)
      user.profile.monthlyBudget = data.monthlyBudget;

    // Handle avatar upload/deletion
    if (file) {
      try {
        // Delete old avatar from Cloudinary if exists
        if (user.profile.avatar) {
          const publicIdMatch = user.profile.avatar.match(
            /expense-tracker\/([^/]+)\.[^.]+$/,
          );
          if (publicIdMatch) {
            const publicId = `expense-tracker/${publicIdMatch[1]}`;
            try {
              await deleteImage(publicId);
            } catch (deleteError) {
              console.error("Failed to delete old avatar:", deleteError);
              // Continue with upload even if deletion fails
            }
          }
        }

        // Upload new avatar
        const uploadResult = await uploadImage(file);

        // Delete local file after successful upload
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        user.profile.avatar = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        // Clean up local file on upload error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new Error("Failed to upload image");
      }
    }

    await user.save();

    // specific to get clean user object without password
    const updatedUser = await User.findById(data.id).select("-password");

    return {
      success: true,
      message: "Profile updated successfully",
      data: updatedUser!,
    };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    // Cleanup file in case of general error if not already handled
    if (file && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
    }
    return {
      success: false,
      message: error.message || "Failed to update profile",
    };
  }
};
