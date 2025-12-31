import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/user.model.js";
import { AuthResult, LoginData, RegisterData } from "../types/types.js";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

  if (!secret || !expiresIn) {
    throw new Error("JWT environment variables are missing");
  }

  return jwt.sign({ userId }, secret, { expiresIn });
};

export const register = async (userData: RegisterData): Promise<AuthResult> => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      success: false,
      message: "Email already exists",
    };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    success: true,
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  };
};

export const login = async (loginData: LoginData): Promise<AuthResult> => {
  const { email, password } = loginData;

  // Find user with password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  // Generate token
  const token = generateToken(user._id.toString());

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    },
  };
};

export const logout = (): AuthResult => {
  return {
    success: true,
    message: "Logged out successfully",
  };
};
