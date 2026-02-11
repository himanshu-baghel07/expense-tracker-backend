import mongoose, { Schema } from "mongoose";
import { IExpense } from "../types/expense.types.js";

/**
 * Mongoose schema for Expense model
 * Implements requirements 7.1-7.6 from the expense management API spec
 */
const expenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      validate: {
        validator: function (value: number) {
          // Ensure amount has at most 2 decimal places
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message: "Amount must have at most 2 decimal places",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxLength: [50, "Category must not exceed 50 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description must not exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

// Compound index for efficient filtered queries (userId + date)
// Requirement 7.8: Create compound index on user and date fields
expenseSchema.index({ userId: 1, date: -1 });

// Compound index for category filtering
// Improves performance for category-based queries
expenseSchema.index({ userId: 1, category: 1 });

/**
 * Expense model
 * Provides data access layer for expense operations
 */
const Expense = mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
