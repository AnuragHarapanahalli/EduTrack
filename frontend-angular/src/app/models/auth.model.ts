export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  batchId?: number;
  batchName?: string;
  needsPasswordReset?: boolean;
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
  batchId?: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}