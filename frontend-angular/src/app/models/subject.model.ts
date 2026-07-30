export interface Subject {
  id: number;
  name: string;
  code: string;
  instructorName?: string;
  instructorId?: number;
  batchName?: string;
  batchId?: number;
  description?: string;
  totalMilestones?: number;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  batchId?: number;
  description?: string;
}
