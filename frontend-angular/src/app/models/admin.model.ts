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
  panel?: string;
  batch?: string;
  assignedBatches?: string[];
}

export interface CreateAdminUserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: Role;
  panel?: string;
  batch?: string;
  assignedBatches?: string[];
}

export interface UpdateAdminUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
  active?: boolean;
  panel?: string;
  batch?: string;
  assignedBatches?: string[];
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

export interface BulkRowIssue {
  rowNumber: number;
  column: string;
  originalValue: string;
  currentValue: string;
  errorMessage: string;
  allowedFormat: string;
  fixed: boolean;
  ignored: boolean;

  fullName?: string;
  email?: string;
  role?: string;
  panel?: string;
  batch?: string;
  assignedBatches?: string;
}

export interface BulkUploadValidationResponse {
  totalRows: number;
  validCount: number;
  issueCount: number;
  validRows: CreateAdminUserRequest[];
  issues: BulkRowIssue[];
}
