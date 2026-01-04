import User from "../models/user.model.js";
import { GetProfileDetailsInput, UserResponse } from "../types/index.js";

export const getProfileDetails = async (
  data: GetProfileDetailsInput
): Promise<UserResponse> => {
  try {
    const user = await User.findById(data.id);

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
