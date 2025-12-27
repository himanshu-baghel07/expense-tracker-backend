import dotnet from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.routes.js";

dotnet.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use("/api/auth", authRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listen on Port:${PORT}`);
  });
});
