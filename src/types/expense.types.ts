import { Document, Types } from "mongoose";

/**
 * Expense document interface extending Mongoose Document
 * Represents the complete expense record in the database
 */
export interface IExpense extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data structure for creating a new expense
 */
export interface CreateExpenseData {
  userId: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

/**
 * Data structure for updating an existing expense
 * All fields are optional to allow partial updates
 */
export interface UpdateExpenseData {
  amount?: number;
  category?: string;
  date?: Date;
  description?: string;
}

/**
 * Filter parameters for querying expenses
 */
export interface ExpenseFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Summary statistics for expenses
 */
export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

/**
 * Category aggregation data for charts
 */
export interface CategoryData {
  category: string;
  totalAmount: number;
  count: number;
}

/**
 * Monthly trend data for time-series charts
 */
export interface MonthlyTrend {
  month: string;
  year: number;
  totalAmount: number;
  count: number;
}

/**
 * Trend data for time-series charts (weekly, monthly, yearly)
 */
export interface TrendData {
  period: string; // e.g., "2024-W01", "2024-01", "2024"
  year: number;
  week?: number; // For weekly trends
  month?: number; // For monthly trends
  totalAmount: number;
  count: number;
}

/**
 * Trend period type
 */
export type TrendPeriod = "weekly" | "monthly" | "yearly";

/**
 * Time filter for quick date range selection
 */
export type TimeFilter = "24h" | "7d" | "30d" | "90d" | "all";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

/**
 * Service result wrapper for internal operations
 */
export interface ServiceResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}
