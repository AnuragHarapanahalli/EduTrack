package com.edutrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private String fileUrl; // Path to uploaded file in /uploads
    private String submissionLink; // Optional external link (e.g. GitHub/Figma)

    @Column(length = 1000)
    private String comments;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    private Integer qualityRating; // 1 to 5
    private Double timelinessMultiplier; // 1.2, 1.0, or 0.5
    private Double finalPoints; // Computed automatically upon approval

    @Column(length = 1000)
    private String instructorFeedback;

    private LocalDateTime reviewedAt;

    public Submission() {
        this.submittedAt = LocalDateTime.now();
        this.status = SubmissionStatus.SUBMITTED;
        this.finalPoints = 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Milestone getMilestone() { return milestone; }
    public void setMilestone(Milestone milestone) { this.milestone = milestone; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

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
