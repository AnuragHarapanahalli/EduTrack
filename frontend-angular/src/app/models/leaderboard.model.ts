export interface LeaderboardEntry {

  studentId: number;

  studentName: string;

  studentEmail: string;

  totalPoints: number;

  approvedMilestonesCount: number;

  totalSubjectMilestonesCount: number;

  completionPercentage: number;

  rank: number;
}