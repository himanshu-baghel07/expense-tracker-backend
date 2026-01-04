import cors from "cors";
import express, { Application } from "express";
import authRoute from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Add timeout middleware
app.use((req, res, next) => {
  req.setTimeout(60000); // 60 seconds
  res.setTimeout(60000);
  next();
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
