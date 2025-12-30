import dotenv from "dotenv";
import express, { Application } from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.routes.js";

dotenv.config();

const app: Application = express();
const PORT: string | number = process.env.PORT ?? 5001;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);

// Start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on Port: ${PORT}`);
  });
});
