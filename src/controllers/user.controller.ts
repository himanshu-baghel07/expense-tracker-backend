import { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { MulterFile } from "../types/index.js";

export const getProfileDetailsController = async (
  req: Request,
  res: Response,
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

export const updateProfileController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, currency, monthlyBudget } = req.body;
    const file = (req as any).file as MulterFile | undefined;

    const result = await userService.updateProfile(
      {
        id: userId,
        name,
        currency,
        monthlyBudget: monthlyBudget ? Number(monthlyBudget) : undefined,
      },
      file,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
