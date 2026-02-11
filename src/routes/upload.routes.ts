import express from "express";
import {
  deleteImageController,
  uploadImageController,
} from "../controllers/upload.controller.js";

const router = express.Router();

import { upload } from "../middleware/upload.middleware.js";

router.post("/upload", upload.single("image"), uploadImageController);
router.delete("/delete", deleteImageController);

export default router;
