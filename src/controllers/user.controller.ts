import { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export const getProfileDetailsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide UserId",
      });
    }

    const result = await userService.getProfileDetails({
      id: userId,
    });
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Profile Dtl Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
