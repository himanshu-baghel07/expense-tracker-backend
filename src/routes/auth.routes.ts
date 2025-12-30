import express, { Request, Response, Router } from "express";
import { login, register } from "../controllers/authController.js";

const router: Router = express.Router();

router.post("/register", (req: Request, res: Response) => register(req, res));
router.post("/login", (req: Request, res: Response) => login(req, res));

export default router;
