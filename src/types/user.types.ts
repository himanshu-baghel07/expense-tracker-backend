import { IUser } from "./auth.types.js";

export interface GetProfileDetailsInput {
  id: string;
}

export interface UpdateProfileInput {
  id: string;
  name?: string;
  email?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: IUser;
}
