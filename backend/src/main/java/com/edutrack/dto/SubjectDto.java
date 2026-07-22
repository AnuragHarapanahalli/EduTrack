package com.edutrack.dto;

public class SubjectDto {

    public static class CreateSubjectRequest {
        private String name;
        private String code;
        private Long batchId;
        private String description;

        public CreateSubjectRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class SubjectResponse {
        private Long id;
        private String name;
        private String code;
        private String instructorName;
        private Long instructorId;
        private String batchName;
        private Long batchId;
        private String description;
        private int totalMilestones;

        public SubjectResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getInstructorName() { return instructorName; }
        public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

        public Long getInstructorId() { return instructorId; }
        public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getTotalMilestones() { return totalMilestones; }
        public void setTotalMilestones(int totalMilestones) { this.totalMilestones = totalMilestones; }
    }
}
