import mongoose, { Schema } from "mongoose";
import { ICategory } from "./types";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxLength: 30,
    },
    icon: {
      type: String,
      trim: true,
      default: "📁",
    },
    color: {
      type: String,
      trim: true,
      lowercase: true,
      default: "#6366f1",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
