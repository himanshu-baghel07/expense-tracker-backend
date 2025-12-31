import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/database.config.js";

dotenv.config();

const PORT: string | number = process.env.PORT ?? 5001;

// Start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on Port: ${PORT}`);
  });
});
