package com.edutrack.dto;

import com.edutrack.model.Role;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDto {

    public static class AdminUserResponse {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private Long batchId;
        private String batchName;
        private boolean active;
        private boolean needsPasswordReset;
        private LocalDateTime createdAt;
        private int associatedSubjectsCount;

        public AdminUserResponse() {}

        public AdminUserResponse(Long id, String email, String fullName, Role role, Long batchId, String batchName, boolean active, boolean needsPasswordReset, LocalDateTime createdAt, int associatedSubjectsCount) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.batchId = batchId;
            this.batchName = batchName;
            this.active = active;
            this.needsPasswordReset = needsPasswordReset;
            this.createdAt = createdAt;
            this.associatedSubjectsCount = associatedSubjectsCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getBatchName() { return batchName; }
        public void setBatchName(String batchName) { this.batchName = batchName; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public boolean isNeedsPasswordReset() { return needsPasswordReset; }
        public void setNeedsPasswordReset(boolean needsPasswordReset) { this.needsPasswordReset = needsPasswordReset; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public int getAssociatedSubjectsCount() { return associatedSubjectsCount; }
        public void setAssociatedSubjectsCount(int associatedSubjectsCount) { this.associatedSubjectsCount = associatedSubjectsCount; }
    }

    public static class CreateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private Long batchId;

        public CreateUserRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }
    }

    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private Long batchId;
        private Boolean active;

        public UpdateUserRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    public static class ToggleStatusRequest {
        private boolean active;

        public ToggleStatusRequest() {}
        public ToggleStatusRequest(boolean active) { this.active = active; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    public static class BatchResponse {
        private Long id;
        private String name;
        private String academicYear;
        private int studentCount;
        private int subjectCount;

        public BatchResponse() {}

        public BatchResponse(Long id, String name, String academicYear, int studentCount, int subjectCount) {
            this.id = id;
            this.name = name;
            this.academicYear = academicYear;
            this.studentCount = studentCount;
            this.subjectCount = subjectCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

        public int getStudentCount() { return studentCount; }
        public void setStudentCount(int studentCount) { this.studentCount = studentCount; }

        public int getSubjectCount() { return subjectCount; }
        public void setSubjectCount(int subjectCount) { this.subjectCount = subjectCount; }
    }

    public static class CreateBatchRequest {
        private String name;
        private String academicYear;

        public CreateBatchRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    }

    public static class AssignBatchRequest {
        private Long studentId;
        private Long batchId;

        public AssignBatchRequest() {}

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }
    }

    public static class BulkAssignBatchRequest {
        private List<Long> studentIds;
        private Long batchId;

        public BulkAssignBatchRequest() {}

        public List<Long> getStudentIds() { return studentIds; }
        public void setStudentIds(List<Long> studentIds) { this.studentIds = studentIds; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }
    }

    public static class BulkSubjectEnrollmentRequest {
        private List<Long> studentIds;

        public BulkSubjectEnrollmentRequest() {}

        public List<Long> getStudentIds() { return studentIds; }
        public void setStudentIds(List<Long> studentIds) { this.studentIds = studentIds; }
    }

    public static class AssignSubjectBatchRequest {
        private Long batchId;
        private boolean autoEnrollBatchStudents = true;

        public AssignSubjectBatchRequest() {}

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public boolean isAutoEnrollBatchStudents() { return autoEnrollBatchStudents; }
        public void setAutoEnrollBatchStudents(boolean autoEnrollBatchStudents) { this.autoEnrollBatchStudents = autoEnrollBatchStudents; }
    }

    public static class CreateSubjectAdminRequest {
        private String name;
        private String code;
        private Long instructorId;
        private Long batchId;
        private String description;
        private boolean autoEnrollBatchStudents = true;

        public CreateSubjectAdminRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public Long getInstructorId() { return instructorId; }
        public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public boolean isAutoEnrollBatchStudents() { return autoEnrollBatchStudents; }
        public void setAutoEnrollBatchStudents(boolean autoEnrollBatchStudents) { this.autoEnrollBatchStudents = autoEnrollBatchStudents; }
    }

    public static class SystemStatsResponse {
        private long totalUsers;
        private long totalStudents;
        private long totalInstructors;
        private long totalAdmins;
        private long activeUsers;
        private long inactiveUsers;

        private long totalBatches;
        private long totalSubjects;
        private long totalMilestones;
        private long totalSubmissions;

        private long submissionsApproved;
        private long submissionsSubmitted;
        private long submissionsNeedsRevision;
        private long submissionsOverdue;

        public SystemStatsResponse() {}

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getTotalStudents() { return totalStudents; }
        public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

        public long getTotalInstructors() { return totalInstructors; }
        public void setTotalInstructors(long totalInstructors) { this.totalInstructors = totalInstructors; }

        public long getTotalAdmins() { return totalAdmins; }
        public void setTotalAdmins(long totalAdmins) { this.totalAdmins = totalAdmins; }

        public long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

        public long getInactiveUsers() { return inactiveUsers; }
        public void setInactiveUsers(long inactiveUsers) { this.inactiveUsers = inactiveUsers; }

        public long getTotalBatches() { return totalBatches; }
        public void setTotalBatches(long totalBatches) { this.totalBatches = totalBatches; }

        public long getTotalSubjects() { return totalSubjects; }
        public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

        public long getTotalMilestones() { return totalMilestones; }
        public void setTotalMilestones(long totalMilestones) { this.totalMilestones = totalMilestones; }

        public long getTotalSubmissions() { return totalSubmissions; }
        public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }

        public long getSubmissionsApproved() { return submissionsApproved; }
        public void setSubmissionsApproved(long submissionsApproved) { this.submissionsApproved = submissionsApproved; }

        public long getSubmissionsSubmitted() { return submissionsSubmitted; }
        public void setSubmissionsSubmitted(long submissionsSubmitted) { this.submissionsSubmitted = submissionsSubmitted; }

        public long getSubmissionsNeedsRevision() { return submissionsNeedsRevision; }
        public void setSubmissionsNeedsRevision(long submissionsNeedsRevision) { this.submissionsNeedsRevision = submissionsNeedsRevision; }

        public long getSubmissionsOverdue() { return submissionsOverdue; }
        public void setSubmissionsOverdue(long submissionsOverdue) { this.submissionsOverdue = submissionsOverdue; }
    }
}
