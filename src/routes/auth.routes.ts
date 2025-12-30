import express, { Request, Response, Router } from "express";
import { register } from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/register", (req: Request, res: Response) => register(req, res));

export default router;
