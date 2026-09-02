package com.edutrack.dto;

public class SubjectDto {

    public static class CreateSubjectRequest {
        private String name;
        private String code;
        private String description;
        private String batch;

        public CreateSubjectRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }
    }

    public static class SubjectResponse {
        private Long id;
        private String name;
        private String code;
        private String instructorName;
        private Long instructorId;
        private String description;
        private String batch;
        private int totalMilestones;
        private int enrolledStudentsCount;

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

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public int getTotalMilestones() { return totalMilestones; }
        public void setTotalMilestones(int totalMilestones) { this.totalMilestones = totalMilestones; }

        public int getEnrolledStudentsCount() { return enrolledStudentsCount; }
        public void setEnrolledStudentsCount(int enrolledStudentsCount) { this.enrolledStudentsCount = enrolledStudentsCount; }
    }
}
