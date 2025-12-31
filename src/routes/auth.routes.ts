import express, { Request, Response, Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";

const router: Router = express.Router();

router.post("/register", (req: Request, res: Response) => register(req, res));
router.post("/login", (req: Request, res: Response) => login(req, res));
router.post("/logout", (req: Request, res: Response) => logout(req, res));

export default router;
