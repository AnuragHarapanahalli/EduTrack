package com.edutrack.dto;

import com.edutrack.model.SubmissionStatus;
import java.time.LocalDateTime;

public class SubmissionDto {

    public static class ReviewSubmissionRequest {
        private SubmissionStatus status; // APPROVED or NEEDS_REVISION
        private Integer qualityRating; // 1 to 5
        private String feedback;

        public ReviewSubmissionRequest() {}

        public SubmissionStatus getStatus() { return status; }
        public void setStatus(SubmissionStatus status) { this.status = status; }

        public Integer getQualityRating() { return qualityRating; }
        public void setQualityRating(Integer qualityRating) { this.qualityRating = qualityRating; }

        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }

    public static class SubmissionResponse {
        private Long id;
        private Long milestoneId;
        private String milestoneTitle;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String fileUrl;
        private String submissionLink;
        private String comments;
        private LocalDateTime submittedAt;
        private SubmissionStatus status;
        private Integer qualityRating;
        private Double timelinessMultiplier;
        private Double finalPoints;
        private String instructorFeedback;
        private LocalDateTime reviewedAt;

        public SubmissionResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getMilestoneId() { return milestoneId; }
        public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

        public String getMilestoneTitle() { return milestoneTitle; }
        public void setMilestoneTitle(String milestoneTitle) { this.milestoneTitle = milestoneTitle; }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getSubmissionLink() { return submissionLink; }
        public void setSubmissionLink(String submissionLink) { this.submissionLink = submissionLink; }

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }

        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

        public SubmissionStatus getStatus() { return status; }
        public void setStatus(SubmissionStatus status) { this.status = status; }

        public Integer getQualityRating() { return qualityRating; }
        public void setQualityRating(Integer qualityRating) { this.qualityRating = qualityRating; }

        public Double getTimelinessMultiplier() { return timelinessMultiplier; }
        public void setTimelinessMultiplier(Double timelinessMultiplier) { this.timelinessMultiplier = timelinessMultiplier; }

        public Double getFinalPoints() { return finalPoints; }
        public void setFinalPoints(Double finalPoints) { this.finalPoints = finalPoints; }

        public String getInstructorFeedback() { return instructorFeedback; }
        public void setInstructorFeedback(String instructorFeedback) { this.instructorFeedback = instructorFeedback; }

        public LocalDateTime getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    }
}
