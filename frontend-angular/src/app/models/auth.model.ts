export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  needsPasswordReset?: boolean;
  active?: boolean;
  panel?: string;
  batch?: string;
  assignedBatches?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}