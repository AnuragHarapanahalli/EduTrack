export type SubmissionStatus = 'SUBMITTED' | 'APPROVED' | 'NEEDS_REVISION' | 'OVERDUE';

export interface Submission {
  id: number;
  milestoneId: number;
  milestoneTitle?: string;
  studentId: number;
  studentName?: string;
  studentEmail?: string;
  fileUrl?: string;
  submissionLink?: string;
  comments?: string;
  submittedAt?: string;
  status: SubmissionStatus;
  qualityRating?: number;
  timelinessMultiplier?: number;
  finalPoints?: number;
  instructorFeedback?: string;
  reviewedAt?: string;
}

export interface MilestoneRosterEntry {
  studentId: number;
  studentName: string;
  studentEmail: string;
  submissionId?: number;
  status: SubmissionStatus;
  submittedAt?: string;
  timelinessLabel: string;
  timelinessMultiplier?: number;
  fileUrl?: string;
  submissionLink?: string;
  comments?: string;
  qualityRating?: number;
  finalPoints?: number;
  instructorFeedback?: string;
}

export interface ReviewSubmissionRequest {
  status: SubmissionStatus;
  qualityRating: number;
  feedback?: string;
}
