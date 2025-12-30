import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpense extends Document {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
  userId: Types.ObjectId;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory extends Document {
  name: string;
  icon?: string;
  color?: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
