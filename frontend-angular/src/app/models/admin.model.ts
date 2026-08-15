import { Role } from './auth.model';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  needsPasswordReset: boolean;
  createdAt: string;
  associatedSubjectsCount: number;
}

export interface CreateAdminUserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: Role;
}

export interface UpdateAdminUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
  active?: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;

  totalSubjects: number;
  totalMilestones: number;
  totalSubmissions: number;

  submissionsApproved: number;
  submissionsSubmitted: number;
  submissionsNeedsRevision: number;
  submissionsOverdue: number;
}

export interface CreateSubjectAdminRequest {
  name: string;
  code: string;
  instructorId: number;
  description?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  details: string;
  performedByEmail: string;
  timestamp: string;
}
