import express, { Application } from "express";
import authRoute from "./routes/auth.routes.js";

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);

export default app;
