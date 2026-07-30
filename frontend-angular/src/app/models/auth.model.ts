export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  batchId?: number;
  batchName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}
