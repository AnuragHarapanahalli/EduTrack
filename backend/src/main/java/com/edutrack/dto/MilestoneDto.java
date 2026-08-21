package com.edutrack.dto;

import java.time.LocalDateTime;

public class MilestoneDto {

    public static class CreateMilestoneRequest {
        private Long subjectId;
        private String title;
        private String description;
        private String deadline; // ISO format "2026-08-15T23:59:00"
        private Double basePoints;
        private Double maxMarks;
        private String requiredDeliverables;
        private Boolean isMandatory;

        public CreateMilestoneRequest() {}

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }

        public Double getBasePoints() { return basePoints; }
        public void setBasePoints(Double basePoints) { this.basePoints = basePoints; }

        public Double getMaxMarks() { return maxMarks; }
        public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

        public String getRequiredDeliverables() { return requiredDeliverables; }
        public void setRequiredDeliverables(String requiredDeliverables) { this.requiredDeliverables = requiredDeliverables; }

        public Boolean getIsMandatory() { return isMandatory; }
        public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }
    }

    public static class MilestoneResponse {
        private Long id;
        private Long subjectId;
        private String subjectName;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private Double basePoints;
        private Double maxMarks;
        private String requiredDeliverables;
        private Boolean isMandatory;
        private Boolean isOverdue;

        public MilestoneResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getSubjectId() { return subjectId; }
        public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public LocalDateTime getDeadline() { return deadline; }
        public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

        public Double getBasePoints() { return basePoints; }
        public void setBasePoints(Double basePoints) { this.basePoints = basePoints; }

        public Double getMaxMarks() { return maxMarks; }
        public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }

        public String getRequiredDeliverables() { return requiredDeliverables; }
        public void setRequiredDeliverables(String requiredDeliverables) { this.requiredDeliverables = requiredDeliverables; }

        public Boolean getIsMandatory() { return isMandatory; }
        public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }

        public Boolean getIsOverdue() { return isOverdue; }
        public void setIsOverdue(Boolean isOverdue) { this.isOverdue = isOverdue; }
    }
}
