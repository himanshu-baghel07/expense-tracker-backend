import { Request, Response } from "express";
import * as expenseService from "../services/expense.service.js";

/**
 * Create a new expense
 * Requirements: 1.1, 6.1, 6.2, 6.3, 6.6, 10.1
 *
 * POST /api/expenses
 *
 * Request body:
 * - amount: number (required, positive)
 * - category: string (required)
 * - date: string (required, ISO date format)
 * - description: string (optional)
 *
 * Response: 201 Created with expense data
 */
export const createExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract and validate request body
    const { amount, category, date, description } = req.body as {
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    };

    // Validate required fields (Requirement 8.1)
    if (amount === undefined || !category || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: amount, category, and date",
      });
    }

    // Validate amount is a number and positive (Requirement 8.2)
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Validate category is not empty
    if (typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category is required and cannot be empty",
      });
    }

    // Parse and validate date (Requirement 8.3)
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please provide a valid ISO date string",
      });
    }

    // Call createExpense service (Requirement 1.1)
    const result = await expenseService.createExpense({
      userId,
      amount,
      category,
      date: parsedDate,
      description,
    });

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response with 201 status (Requirements 6.1, 6.2, 6.3, 6.6, 10.1)
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Create Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get list of expenses with pagination and filtering
 * Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.4, 10.2
 *
 * GET /api/expenses
 *
 * Query parameters:
 * - page: number (optional, default 1)
 * - limit: number (optional, default 10, max 100)
 * - startDate: string (optional, ISO date format)
 * - endDate: string (optional, ISO date format)
 * - category: string (optional)
 * - sortBy: string (optional, default "date")
 * - sortOrder: "asc" | "desc" (optional, default "desc")
 *
 * Response: 200 OK with expenses array and pagination metadata
 */
export const getExpenseList = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract query parameters
    const { page, limit, startDate, endDate, category, sortBy, sortOrder } =
      req.query as {
        page?: string;
        limit?: string;
        startDate?: string;
        endDate?: string;
        category?: string;
        sortBy?: string;
        sortOrder?: string;
      };

    // Parse and validate pagination parameters (Requirement 2.1)
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    // Validate page number
    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    // Validate limit
    if (
      parsedLimit !== undefined &&
      (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive integer between 1 and 100",
      });
    }

    // Parse and validate date filters (Requirement 2.2)
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid startDate format. Please provide a valid ISO date string",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid endDate format. Please provide a valid ISO date string",
        });
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    // Validate sortOrder (Requirement 2.4)
    if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
      return res.status(400).json({
        success: false,
        message: 'sortOrder must be either "asc" or "desc"',
      });
    }

    // Build ExpenseFilters object (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)
    const filters = {
      userId,
      page: parsedPage,
      limit: parsedLimit,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      category: category?.trim(),
      sortBy: sortBy?.trim(),
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    // Call getExpenseList service (Requirement 1.2)
    const result = await expenseService.getExpenseList(filters);

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response with data and meta (Requirements 6.1, 6.2, 6.3, 6.4, 10.2)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data?.expenses,
      meta: result.data?.meta,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Get Expense List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get a single expense by ID
 * Requirements: 1.3, 8.4, 10.2
 *
 * GET /api/expenses/:id
 *
 * Route parameters:
 * - id: string (required, expense ID)
 *
 * Response: 200 OK with expense data or 404 Not Found
 */
export const getExpenseById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract expenseId from route params
    const { id: expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    // Call getExpenseById service (Requirement 1.3)
    const result = await expenseService.getExpenseById(userId, expenseId);

    // Handle service errors
    if (!result.success) {
      // Return 404 for not found errors (Requirement 8.4)
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response (Requirements 6.1, 6.2, 6.3, 10.2)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Get Expense By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update an existing expense
 * Requirements: 1.4, 10.3
 *
 * PUT /api/expenses/:id
 *
 * Route parameters:
 * - id: string (required, expense ID)
 *
 * Request body (all fields optional):
 * - amount: number (optional, positive)
 * - category: string (optional)
 * - date: string (optional, ISO date format)
 * - description: string (optional)
 *
 * Response: 200 OK with updated expense data or error
 */
export const updateExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract expenseId from route params
    const { id: expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    // Extract and validate request body
    const { amount, category, date, description } = req.body as {
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    };

    // Validate at least one field is provided for update
    if (
      amount === undefined &&
      category === undefined &&
      date === undefined &&
      description === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });
    }

    // Validate amount if provided (Requirement 8.2)
    if (amount !== undefined) {
      if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number",
        });
      }
    }

    // Validate category if provided
    if (category !== undefined) {
      if (typeof category !== "string" || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
    }

    // Parse and validate date if provided (Requirement 8.3)
    let parsedDate: Date | undefined;
    if (date !== undefined) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid date format. Please provide a valid ISO date string",
        });
      }
    }

    // Build update data object
    const updateData: {
      amount?: number;
      category?: string;
      date?: Date;
      description?: string;
    } = {};

    if (amount !== undefined) {
      updateData.amount = amount;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    if (parsedDate !== undefined) {
      updateData.date = parsedDate;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    // Call updateExpense service (Requirement 1.4)
    const result = await expenseService.updateExpense(
      userId,
      expenseId,
      updateData,
    );

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response (Requirements 6.1, 6.2, 6.3, 10.3)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Update Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Delete an expense
 * Requirements: 1.5, 10.4
 *
 * DELETE /api/expenses/:id
 *
 * Route parameters:
 * - id: string (required, expense ID)
 *
 * Response: 200 OK with success confirmation or error
 */
export const deleteExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract expenseId from route params
    const { id: expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    // Call deleteExpense service (Requirement 1.5)
    const result = await expenseService.deleteExpense(userId, expenseId);

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized success response (Requirements 6.1, 6.2, 10.4)
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Delete Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get expense summary with aggregated statistics
 * Requirements: 3.1, 3.2, 3.3, 3.4, 10.2
 *
 * GET /api/expenses/summary
 *
 * Query parameters:
 * - startDate: string (optional, ISO date format)
 * - endDate: string (optional, ISO date format)
 *
 * Response: 200 OK with summary data (totalAmount, totalCount, averageAmount)
 */
export const getExpenseSummary = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract query parameters
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    // Parse and validate date filters (Requirement 3.4)
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid startDate format. Please provide a valid ISO date string",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid endDate format. Please provide a valid ISO date string",
        });
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    // Call getExpenseSummary service (Requirements 3.1, 3.2, 3.3, 3.4)
    const result = await expenseService.getExpenseSummary(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response with summary data (Requirements 6.1, 6.2, 6.3, 10.2)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Get Expense Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get category chart data with expenses grouped by category
 * Requirements: 4.1, 4.2, 4.3, 4.4, 10.2
 *
 * GET /api/expenses/chart/category
 *
 * Query parameters:
 * - startDate: string (optional, ISO date format)
 * - endDate: string (optional, ISO date format)
 *
 * Response: 200 OK with category data array (category, totalAmount, count)
 */
export const getCategoryChartData = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract query parameters
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    // Parse and validate date filters (Requirement 4.3)
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid startDate format. Please provide a valid ISO date string",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid endDate format. Please provide a valid ISO date string",
        });
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    // Call getCategoryChartData service (Requirements 4.1, 4.2, 4.3, 4.4)
    const result = await expenseService.getCategoryChartData(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response with category data (Requirements 6.1, 6.2, 6.3, 10.2)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Get Category Chart Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get monthly trend data with expenses grouped by month
 * Requirements: 5.1, 5.2, 5.3, 5.4, 10.2
 *
 * GET /api/expenses/chart/monthly
 *
 * Query parameters:
 * - startDate: string (optional, ISO date format)
 * - endDate: string (optional, ISO date format)
 *
 * Response: 200 OK with monthly trend data array (month, year, totalAmount, count)
 */
export const getMonthlyTrend = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // Extract userId from authenticated request (Requirement 9.5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Extract query parameters
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    // Parse and validate date filters (Requirement 5.3)
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid startDate format. Please provide a valid ISO date string",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid endDate format. Please provide a valid ISO date string",
        });
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    // Call getMonthlyTrend service (Requirements 5.1, 5.2, 5.3, 5.4)
    const result = await expenseService.getMonthlyTrend(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    // Handle service errors
    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    // Return standardized response with trend data (Requirements 6.1, 6.2, 6.3, 10.2)
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle errors with appropriate status codes (Requirement 8.5)
    console.error("Get Monthly Trend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
