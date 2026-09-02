export interface Subject {
  id: number;
  name: string;
  code: string;
  instructorName?: string;
  instructorId?: number;
  description?: string;
  batch?: string;
  totalMilestones?: number;
  enrolledStudentsCount?: number;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  batch?: string;
}
