import express, { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getCategoryChartData,
  getExpenseById,
  getExpenseList,
  getExpenseSummary,
  getMonthlyTrend,
  updateExpense,
} from "../controllers/expense.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

// Apply authentication middleware to all routes (Requirements 9.1, 9.2)
// All expense endpoints require authentication

// Analytics routes - MUST be defined BEFORE /:id route to avoid conflicts
// GET /api/expenses/summary - Get expense summary statistics
router.get("/summary", authenticateToken, getExpenseSummary);

// GET /api/expenses/chart/category - Get category chart data
router.get("/chart/category", authenticateToken, getCategoryChartData);

// GET /api/expenses/chart/trend - Get trend data (weekly, monthly, yearly)
router.get("/chart/trend", authenticateToken, getTrendData);

// GET /api/expenses/chart/monthly - Get monthly trend data (legacy, kept for backward compatibility)
router.get("/chart/monthly", authenticateToken, getMonthlyTrend);

// CRUD routes
// POST /api/expenses - Create a new expense (Requirement 10.1)
router.post("/", authenticateToken, createExpense);

// GET /api/expenses - Get expense list with pagination and filters (Requirement 10.2)
router.get("/", authenticateToken, getExpenseList);

// GET /api/expenses/:id - Get single expense by ID (Requirement 10.2)
router.get("/:id", authenticateToken, getExpenseById);

// PUT /api/expenses/:id - Update an expense (Requirement 10.3)
router.put("/:id", authenticateToken, updateExpense);

// DELETE /api/expenses/:id - Delete an expense (Requirement 10.4)
router.delete("/:id", authenticateToken, deleteExpense);

export default router;
