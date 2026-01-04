import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/auth.types.js";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    profile: {
      avatar: {
        type: String,
        default: null,
      },

      currency: {
        type: String,
        default: "INR",
      },

      monthlyBudget: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
