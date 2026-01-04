import express, { Router } from "express";
import { getProfileDetailsController } from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

router.get("/get-profile", authenticateToken, getProfileDetailsController);

export default router;
