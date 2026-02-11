import { Request, Response } from "express";
import * as expenseService from "../services/expense.service.js";

export const createExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { amount, category, date, description } = req.body as {
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    };

    if (amount === undefined || !category || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: amount, category, and date",
      });
    }

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    if (typeof category !== "string" || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category is required and cannot be empty",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please provide a valid ISO date string",
      });
    }

    const result = await expenseService.createExpense({
      userId,
      amount,
      category,
      date: parsedDate,
      description,
    });

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Create Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getExpenseList = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (
      parsedLimit !== undefined &&
      (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive integer between 1 and 100",
      });
    }

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

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
      return res.status(400).json({
        success: false,
        message: 'sortOrder must be either "asc" or "desc"',
      });
    }

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

    const result = await expenseService.getExpenseList(filters);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data?.expenses,
      meta: result.data?.meta,
    });
  } catch (error) {
    console.error("Get Expense List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
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

    const result = await expenseService.getExpenseById(userId, expenseId);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Get Expense By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id: expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    const { amount, category, date, description } = req.body as {
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    };

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

    if (amount !== undefined) {
      if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number",
        });
      }
    }

    if (category !== undefined) {
      if (typeof category !== "string" || category.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
    }

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

    const result = await expenseService.updateExpense(
      userId,
      expenseId,
      updateData,
    );

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Update Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id: expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    const result = await expenseService.deleteExpense(userId, expenseId);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getExpenseSummary = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

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

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    const result = await expenseService.getExpenseSummary(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Get Expense Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getCategoryChartData = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

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

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    const result = await expenseService.getCategoryChartData(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Get Category Chart Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMonthlyTrend = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

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

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "startDate must be before or equal to endDate",
      });
    }

    const result = await expenseService.getMonthlyTrend(
      userId,
      parsedStartDate,
      parsedEndDate,
    );

    if (!result.success) {
      return res.status(result.statusCode || 500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Get Monthly Trend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
