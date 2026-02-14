import { Types } from "mongoose";
import Expense from "../models/expense.model.js";
import {
  CategoryData,
  CreateExpenseData,
  ExpenseFilters,
  ExpenseSummary,
  IExpense,
  MonthlyTrend,
  PaginationMeta,
  ServiceResult,
  TimeFilter,
  TrendData,
  TrendPeriod,
  UpdateExpenseData,
} from "../types/expense.types.js";

/**
 * Helper function to calculate date range based on time filter
 * @param timeFilter - Quick time filter (24h, 7d, 30d, 90d, all)
 * @returns Object with startDate and endDate, or undefined for 'all'
 */
const calculateDateRange = (
  timeFilter?: TimeFilter,
): { startDate?: Date; endDate?: Date } => {
  if (!timeFilter || timeFilter === "all") {
    return {};
  }

  const now = new Date();
  const endDate = now;
  let startDate: Date;

  switch (timeFilter) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return { startDate, endDate };
};

/**
 * Create a new expense
 * Requirement 1.1: Create expense with amount, category, date, and description
 *
 * @param data - Expense creation data including userId
 * @returns ServiceResult with created expense or error
 */
export const createExpense = async (
  data: CreateExpenseData,
): Promise<ServiceResult<IExpense>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(data.userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate amount
    if (data.amount <= 0) {
      return {
        success: false,
        message: "Amount must be greater than 0",
        statusCode: 400,
      };
    }

    // Validate category
    if (!data.category || data.category.trim().length === 0) {
      return {
        success: false,
        message: "Category is required",
        statusCode: 400,
      };
    }

    // Validate date
    if (
      !data.date ||
      !(data.date instanceof Date) ||
      isNaN(data.date.getTime())
    ) {
      return {
        success: false,
        message: "Valid date is required",
        statusCode: 400,
      };
    }

    // Create expense document
    const expense = new Expense({
      userId: new Types.ObjectId(data.userId),
      amount: data.amount,
      category: data.category.trim(),
      date: data.date,
      description: data.description?.trim() || "",
    });

    // Save to database
    await expense.save();

    return {
      success: true,
      message: "Expense created successfully",
      data: expense,
      statusCode: 201,
    };
  } catch (error: any) {
    console.error("Error creating expense:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ");
      return {
        success: false,
        message: `Validation error: ${messages}`,
        statusCode: 400,
      };
    }

    // Handle other errors
    return {
      success: false,
      message: "Failed to create expense",
      statusCode: 500,
    };
  }
};

/**
 * Get list of expenses with pagination and filtering
 * Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 *
 * @param filters - Filter parameters including userId, pagination, date range, category, and sorting
 * @returns ServiceResult with expenses array and pagination metadata
 */
export const getExpenseList = async (
  filters: ExpenseFilters,
): Promise<ServiceResult<{ expenses: IExpense[]; meta: PaginationMeta }>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(filters.userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Build MongoDB query
    const query: any = { userId: new Types.ObjectId(filters.userId) };

    // Apply date range filter (Requirement 2.2)
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate;
      }
    }

    // Apply category filter (Requirement 2.3)
    if (filters.category) {
      query.category = filters.category.trim();
    }

    // Pagination parameters (Requirement 2.1)
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit =
      filters.limit && filters.limit > 0 && filters.limit <= 100
        ? filters.limit
        : 10;
    const skip = (page - 1) * limit;

    // Build sort object (Requirement 2.4)
    const sortBy = filters.sortBy || "date";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };

    // Get total count for pagination metadata
    const total = await Expense.countDocuments(query);

    // Execute query with pagination and sorting (Requirement 2.5)
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Calculate pagination metadata (Requirement 2.6)
    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: "Expenses retrieved successfully",
      data: { expenses, meta },
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving expense list:", error);

    return {
      success: false,
      message: "Failed to retrieve expenses",
      statusCode: 500,
    };
  }
};

/**
 * Get a single expense by ID
 * Requirement 1.3: Retrieve specific expense by ID if it belongs to the user
 *
 * @param userId - The ID of the user requesting the expense
 * @param expenseId - The ID of the expense to retrieve
 * @returns ServiceResult with expense or not found error
 */
export const getExpenseById = async (
  userId: string,
  expenseId: string,
): Promise<ServiceResult<IExpense>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate expenseId format
    if (!Types.ObjectId.isValid(expenseId)) {
      return {
        success: false,
        message: "Invalid expense ID format",
        statusCode: 400,
      };
    }

    // Query expense by ID and userId to ensure user owns the expense
    const expense = await Expense.findOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    }).exec();

    // Return not found error if expense doesn't exist or doesn't belong to user
    if (!expense) {
      return {
        success: false,
        message: "Expense not found",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Expense retrieved successfully",
      data: expense,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving expense by ID:", error);

    return {
      success: false,
      message: "Failed to retrieve expense",
      statusCode: 500,
    };
  }
};

/**
 * Update an existing expense
 * Requirement 1.4: Update expense with new data if it belongs to the user
 *
 * @param userId - The ID of the user requesting the update
 * @param expenseId - The ID of the expense to update
 * @param data - Partial expense data to update
 * @returns ServiceResult with updated expense or error
 */
export const updateExpense = async (
  userId: string,
  expenseId: string,
  data: UpdateExpenseData,
): Promise<ServiceResult<IExpense>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate expenseId format
    if (!Types.ObjectId.isValid(expenseId)) {
      return {
        success: false,
        message: "Invalid expense ID format",
        statusCode: 400,
      };
    }

    // Validate update data if provided
    if (data.amount !== undefined && data.amount <= 0) {
      return {
        success: false,
        message: "Amount must be greater than 0",
        statusCode: 400,
      };
    }

    if (
      data.category !== undefined &&
      (!data.category || data.category.trim().length === 0)
    ) {
      return {
        success: false,
        message: "Category cannot be empty",
        statusCode: 400,
      };
    }

    if (
      data.date !== undefined &&
      (!(data.date instanceof Date) || isNaN(data.date.getTime()))
    ) {
      return {
        success: false,
        message: "Valid date is required",
        statusCode: 400,
      };
    }

    // First, verify the expense exists and belongs to the user
    const existingExpense = await Expense.findOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    }).exec();

    if (!existingExpense) {
      return {
        success: false,
        message: "Expense not found",
        statusCode: 404,
      };
    }

    // Prepare update data with trimmed strings
    const updateData: any = {};
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.category !== undefined) {
      updateData.category = data.category.trim();
    }
    if (data.date !== undefined) {
      updateData.date = data.date;
    }
    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    // Update the expense and return the updated document
    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: new Types.ObjectId(expenseId),
        userId: new Types.ObjectId(userId),
      },
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();

    // This should not happen since we already verified the expense exists
    if (!updatedExpense) {
      return {
        success: false,
        message: "Failed to update expense",
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error updating expense:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(", ");
      return {
        success: false,
        message: `Validation error: ${messages}`,
        statusCode: 400,
      };
    }

    // Handle other errors
    return {
      success: false,
      message: "Failed to update expense",
      statusCode: 500,
    };
  }
};

/**
 * Delete an expense
 * Requirement 1.5: Delete expense if it belongs to the user
 *
 * @param userId - The ID of the user requesting the deletion
 * @param expenseId - The ID of the expense to delete
 * @returns ServiceResult with success confirmation or error
 */
export const deleteExpense = async (
  userId: string,
  expenseId: string,
): Promise<ServiceResult<void>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate expenseId format
    if (!Types.ObjectId.isValid(expenseId)) {
      return {
        success: false,
        message: "Invalid expense ID format",
        statusCode: 400,
      };
    }

    // First, verify the expense exists and belongs to the user
    const existingExpense = await Expense.findOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    }).exec();

    if (!existingExpense) {
      return {
        success: false,
        message: "Expense not found",
        statusCode: 404,
      };
    }

    // Delete the expense
    await Expense.deleteOne({
      _id: new Types.ObjectId(expenseId),
      userId: new Types.ObjectId(userId),
    }).exec();

    return {
      success: true,
      message: "Expense deleted successfully",
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error deleting expense:", error);

    return {
      success: false,
      message: "Failed to delete expense",
      statusCode: 500,
    };
  }
};

/**
 * Get expense summary with aggregated statistics
 * Requirements 3.1, 3.2, 3.3, 3.4: Calculate total amount, count, and average
 *
 * @param userId - The ID of the user requesting the summary
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns ServiceResult with ExpenseSummary or error
 */
export const getExpenseSummary = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ServiceResult<ExpenseSummary>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage: filter by userId and optional date range (Requirement 3.4)
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
    };

    // Apply date range filter if provided
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = startDate;
      }
      if (endDate) {
        matchStage.date.$lte = endDate;
      }
    }

    pipeline.push({ $match: matchStage });

    // Group stage: calculate aggregated statistics
    pipeline.push({
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Requirement 3.1
        totalCount: { $sum: 1 }, // Requirement 3.2
        averageAmount: { $avg: "$amount" }, // Requirement 3.3
      },
    });

    // Project stage: format output and round average to 2 decimal places
    pipeline.push({
      $project: {
        _id: 0,
        totalAmount: 1,
        totalCount: 1,
        averageAmount: { $round: ["$averageAmount", 2] },
      },
    });

    // Execute aggregation pipeline (Requirement 3.5)
    const result = await Expense.aggregate(pipeline).exec();

    // If no expenses found, return zeros
    if (result.length === 0) {
      return {
        success: true,
        message: "Expense summary retrieved successfully",
        data: {
          totalAmount: 0,
          totalCount: 0,
          averageAmount: 0,
        },
        statusCode: 200,
      };
    }

    return {
      success: true,
      message: "Expense summary retrieved successfully",
      data: result[0],
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving expense summary:", error);

    return {
      success: false,
      message: "Failed to retrieve expense summary",
      statusCode: 500,
    };
  }
};

/**
 * Get category chart data with expenses grouped by category
 * Requirements 4.1, 4.2, 4.3, 4.4: Group by category, calculate totals, apply filters, sort by amount
 *
 * @param userId - The ID of the user requesting the chart data
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns ServiceResult with CategoryData array or error
 */
export const getCategoryChartData = async (
  userId: string,
  timeFilter?: TimeFilter,
  startDate?: Date,
  endDate?: Date,
): Promise<ServiceResult<CategoryData[]>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate timeFilter if provided
    if (
      timeFilter &&
      !["24h", "7d", "30d", "90d", "all"].includes(timeFilter)
    ) {
      return {
        success: false,
        message:
          "Invalid time filter. Must be '24h', '7d', '30d', '90d', or 'all'",
        statusCode: 400,
      };
    }

    // Calculate date range from timeFilter if provided, otherwise use custom dates
    let dateRange: { startDate?: Date; endDate?: Date };
    if (timeFilter) {
      dateRange = calculateDateRange(timeFilter);
    } else {
      dateRange = { startDate, endDate };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage: filter by userId and optional date range
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
    };

    // Apply date range filter if provided
    if (dateRange.startDate || dateRange.endDate) {
      matchStage.date = {};
      if (dateRange.startDate) {
        matchStage.date.$gte = dateRange.startDate;
      }
      if (dateRange.endDate) {
        matchStage.date.$lte = dateRange.endDate;
      }
    }

    pipeline.push({ $match: matchStage });

    // Group stage: group by category and calculate totals
    pipeline.push({
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    });

    // Project stage: format output with proper field names
    pipeline.push({
      $project: {
        _id: 0,
        category: "$_id",
        totalAmount: 1,
        count: 1,
      },
    });

    // Sort stage: sort by totalAmount descending
    pipeline.push({
      $sort: { totalAmount: -1 },
    });

    // Execute aggregation pipeline
    const result = await Expense.aggregate(pipeline).exec();

    return {
      success: true,
      message: "Category chart data retrieved successfully",
      data: result,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving category chart data:", error);

    return {
      success: false,
      message: "Failed to retrieve category chart data",
      statusCode: 500,
    };
  }
};

/**
 * Get monthly trend data with expenses grouped by month
 * Requirements 5.1, 5.2, 5.3, 5.4: Group by month, calculate totals, apply filters, sort chronologically
 *
 * @param userId - The ID of the user requesting the trend data
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns ServiceResult with MonthlyTrend array or error
 */
export const getMonthlyTrend = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ServiceResult<MonthlyTrend[]>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage: filter by userId and optional date range (Requirement 5.3)
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
    };

    // Apply date range filter if provided
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = startDate;
      }
      if (endDate) {
        matchStage.date.$lte = endDate;
      }
    }

    pipeline.push({ $match: matchStage });

    // Group stage: group by year and month and calculate totals (Requirements 5.1, 5.2)
    pipeline.push({
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        totalAmount: { $sum: "$amount" }, // Requirement 5.1
        count: { $sum: 1 }, // Requirement 5.2
      },
    });

    // Project stage: format output with proper field names
    pipeline.push({
      $project: {
        _id: 0,
        year: "$_id.year",
        month: { $toString: "$_id.month" }, // Convert month number to string
        totalAmount: 1,
        count: 1,
      },
    });

    // Sort stage: sort chronologically from oldest to newest (Requirement 5.4)
    pipeline.push({
      $sort: { year: 1, month: 1 },
    });

    // Execute aggregation pipeline (Requirement 5.5)
    const result = await Expense.aggregate(pipeline).exec();

    return {
      success: true,
      message: "Monthly trend data retrieved successfully",
      data: result,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving monthly trend data:", error);

    return {
      success: false,
      message: "Failed to retrieve monthly trend data",
      statusCode: 500,
    };
  }
};

/**
 * Get trend data with flexible period grouping (weekly, monthly, yearly)
 * Supports weekly, monthly, and yearly aggregation of expenses
 *
 * @param userId - User ID to filter expenses
 * @param period - Grouping period: "weekly", "monthly", or "yearly" (defaults to "monthly")
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns ServiceResult with TrendData array or error
 */
export const getTrendData = async (
  userId: string,
  period: TrendPeriod = "monthly",
  startDate?: Date,
  endDate?: Date,
): Promise<ServiceResult<TrendData[]>> => {
  try {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: "Invalid user ID format",
        statusCode: 400,
      };
    }

    // Validate period
    if (!["weekly", "monthly", "yearly"].includes(period)) {
      return {
        success: false,
        message: "Invalid period. Must be 'weekly', 'monthly', or 'yearly'",
        statusCode: 400,
      };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage: filter by userId and optional date range
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
    };

    // Apply date range filter if provided
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = startDate;
      }
      if (endDate) {
        matchStage.date.$lte = endDate;
      }
    }

    pipeline.push({ $match: matchStage });

    // Group stage: varies based on period
    let groupStage: any;
    let projectStage: any;

    switch (period) {
      case "weekly":
        // Group by year and ISO week
        groupStage = {
          $group: {
            _id: {
              year: { $isoWeekYear: "$date" },
              week: { $isoWeek: "$date" },
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        };

        projectStage = {
          $project: {
            _id: 0,
            year: "$_id.year",
            week: "$_id.week",
            period: {
              $concat: [
                { $toString: "$_id.year" },
                "-W",
                {
                  $cond: {
                    if: { $lt: ["$_id.week", 10] },
                    then: { $concat: ["0", { $toString: "$_id.week" }] },
                    else: { $toString: "$_id.week" },
                  },
                },
              ],
            },
            totalAmount: 1,
            count: 1,
          },
        };

        pipeline.push(groupStage, projectStage);
        pipeline.push({ $sort: { year: 1, week: 1 } });
        break;

      case "monthly":
        // Group by year and month
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        };

        projectStage = {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            period: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                {
                  $cond: {
                    if: { $lt: ["$_id.month", 10] },
                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                    else: { $toString: "$_id.month" },
                  },
                },
              ],
            },
            totalAmount: 1,
            count: 1,
          },
        };

        pipeline.push(groupStage, projectStage);
        pipeline.push({ $sort: { year: 1, month: 1 } });
        break;

      case "yearly":
        // Group by year only
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$date" },
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        };

        projectStage = {
          $project: {
            _id: 0,
            year: "$_id.year",
            period: { $toString: "$_id.year" },
            totalAmount: 1,
            count: 1,
          },
        };

        pipeline.push(groupStage, projectStage);
        pipeline.push({ $sort: { year: 1 } });
        break;
    }

    // Execute aggregation pipeline
    const result = await Expense.aggregate(pipeline).exec();

    return {
      success: true,
      message: `${period.charAt(0).toUpperCase() + period.slice(1)} trend data retrieved successfully`,
      data: result,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error retrieving trend data:", error);

    return {
      success: false,
      message: "Failed to retrieve trend data",
      statusCode: 500,
    };
  }
};
