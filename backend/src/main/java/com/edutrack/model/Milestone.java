package com.edutrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "milestones")
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(nullable = false)
    private Double basePoints; // Default base points, e.g. 100.0

    @Column(nullable = false)
    private Double maxMarks = 100.0; // Maximum marks configured by instructor

    @Column(length = 2000)
    private String requiredDeliverables; // e.g. "Github Repo URL, SRS PDF"

    private Boolean isMandatory = true;

    private LocalDateTime createdAt;

    public Milestone() {
        this.createdAt = LocalDateTime.now();
        this.isMandatory = true;
        this.maxMarks = 100.0;
    }

    public Milestone(Subject subject, String title, String description, LocalDateTime deadline, Double basePoints, String requiredDeliverables) {
        this(subject, title, description, deadline, basePoints, requiredDeliverables, true);
    }

    public Milestone(Subject subject, String title, String description, LocalDateTime deadline, Double basePoints, String requiredDeliverables, Boolean isMandatory) {
        this.subject = subject;
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.basePoints = basePoints;
        this.requiredDeliverables = requiredDeliverables;
        this.isMandatory = isMandatory != null ? isMandatory : true;
        this.createdAt = LocalDateTime.now();
        this.maxMarks = 100.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public Double getBasePoints() { return basePoints; }
    public void setBasePoints(Double basePoints) { this.basePoints = basePoints; }

    public String getRequiredDeliverables() { return requiredDeliverables; }
    public void setRequiredDeliverables(String requiredDeliverables) { this.requiredDeliverables = requiredDeliverables; }

    public Boolean getIsMandatory() { return isMandatory; }
    public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }
}
