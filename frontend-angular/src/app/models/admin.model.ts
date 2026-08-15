import { Role } from './auth.model';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  batchId?: number;
  batchName?: string;
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
  batchId?: number;
}

export interface UpdateAdminUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
  batchId?: number;
  active?: boolean;
}

export interface AdminBatch {
  id: number;
  name: string;
  academicYear?: string;
  studentCount: number;
  subjectCount: number;
}

export interface CreateBatchRequest {
  name: string;
  academicYear?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;

  totalBatches: number;
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
  batchId: number;
  description?: string;
  autoEnrollBatchStudents?: boolean;
}

