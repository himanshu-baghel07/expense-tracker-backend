import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User.model.js";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

  if (!secret || !expiresIn) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.sign({ userId }, secret, { expiresIn });
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: name, email, and password",
      });
    }

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required field:email and Password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// export const logout =async (req:Request,res:Response):Promise<Response>=>{
// try {
//   const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(400).json({
//         success: false,
//         message: "Refresh token is required in Authorization header",
//       });
//     }

//         const token = authHeader.split(" ")[1];

//          await RefreshTokenModel.deleteOne({ token: token });

//     return res.status(200).json({
//       success: true,
//       message: "Logged out successfully",
//     });

// } catch (error) {

// }
// }
