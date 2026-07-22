package com.edutrack.dto;

public class LeaderboardDto {

    public static class LeaderboardEntryResponse {
        private int rank;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private Double totalPoints;
        private int approvedMilestonesCount;
        private int totalSubjectMilestonesCount;
        private double completionPercentage;

        public LeaderboardEntryResponse() {}

        public LeaderboardEntryResponse(int rank, Long studentId, String studentName, String studentEmail, Double totalPoints, int approvedMilestonesCount, int totalSubjectMilestonesCount, double completionPercentage) {
            this.rank = rank;
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.totalPoints = totalPoints;
            this.approvedMilestonesCount = approvedMilestonesCount;
            this.totalSubjectMilestonesCount = totalSubjectMilestonesCount;
            this.completionPercentage = completionPercentage;
        }

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public Double getTotalPoints() { return totalPoints; }
        public void setTotalPoints(Double totalPoints) { this.totalPoints = totalPoints; }

        public int getApprovedMilestonesCount() { return approvedMilestonesCount; }
        public void setApprovedMilestonesCount(int approvedMilestonesCount) { this.approvedMilestonesCount = approvedMilestonesCount; }

        public int getTotalSubjectMilestonesCount() { return totalSubjectMilestonesCount; }
        public void setTotalSubjectMilestonesCount(int totalSubjectMilestonesCount) { this.totalSubjectMilestonesCount = totalSubjectMilestonesCount; }

        public double getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(double completionPercentage) { this.completionPercentage = completionPercentage; }
    }
}
