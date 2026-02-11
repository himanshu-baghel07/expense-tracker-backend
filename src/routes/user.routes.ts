import express, { Router } from "express";
import {
  getProfileDetailsController,
  updateProfileController,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router: Router = express.Router();

router.get("/get-profile", authenticateToken, getProfileDetailsController);
router.put(
  "/update-profile",
  authenticateToken,
  upload.single("avatar"),
  updateProfileController,
);

export default router;
