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

    const result = await expenseService.createExpense({
      userId,
      ...req.body,
    });

    return res.status(result.statusCode || 201).json(result);
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

    const filters: any = {
      userId,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      category: req.query.category as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
    };

    const result = await expenseService.getExpenseList(filters);

    return res.status(result.statusCode || 200).json(result);
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

    const result = await expenseService.getExpenseById(userId, req.params.id);

    return res.status(result.statusCode || 200).json(result);
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

    const result = await expenseService.updateExpense(
      userId,
      req.params.id,
      req.body,
    );

    return res.status(result.statusCode || 200).json(result);
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

    const result = await expenseService.deleteExpense(userId, req.params.id);

    return res.status(result.statusCode || 200).json(result);
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

    const { startDate, endDate } = req.query;

    const result = await expenseService.getExpenseSummary(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    return res.status(result.statusCode || 200).json(result);
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

    const { timeFilter, startDate, endDate } = req.query;

    const result = await expenseService.getCategoryChartData(
      userId,
      timeFilter as "24h" | "7d" | "30d" | "90d" | "all" | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Category Chart Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getTrendData = async (
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

    const { startDate, endDate, period } = req.query;

    const result = await expenseService.getTrendData(
      userId,
      period as "weekly" | "monthly" | "yearly" | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Trend Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Legacy endpoint for backward compatibility
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

    const { startDate, endDate } = req.query;

    const result = await expenseService.getTrendData(
      userId,
      "monthly",
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );

    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error("Get Monthly Trend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
