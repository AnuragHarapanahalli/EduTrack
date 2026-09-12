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
        private boolean active;
        private boolean needsPasswordReset;
        private LocalDateTime createdAt;
        private int associatedSubjectsCount;
        private String panel;
        private String batch;
        private java.util.Set<String> assignedBatches;

        public AdminUserResponse() {}

        public AdminUserResponse(Long id, String email, String fullName, Role role, boolean active, boolean needsPasswordReset, LocalDateTime createdAt, int associatedSubjectsCount) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
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

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public boolean isNeedsPasswordReset() { return needsPasswordReset; }
        public void setNeedsPasswordReset(boolean needsPasswordReset) { this.needsPasswordReset = needsPasswordReset; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public int getAssociatedSubjectsCount() { return associatedSubjectsCount; }
        public void setAssociatedSubjectsCount(int associatedSubjectsCount) { this.associatedSubjectsCount = associatedSubjectsCount; }

        public String getPanel() { return panel; }
        public void setPanel(String panel) { this.panel = panel; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public java.util.Set<String> getAssignedBatches() { return assignedBatches; }
        public void setAssignedBatches(java.util.Set<String> assignedBatches) { this.assignedBatches = assignedBatches; }
    }

    public static class CreateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private String panel;
        private String batch;
        private java.util.Set<String> assignedBatches;

        public CreateUserRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public String getPanel() { return panel; }
        public void setPanel(String panel) { this.panel = panel; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public java.util.Set<String> getAssignedBatches() { return assignedBatches; }
        public void setAssignedBatches(java.util.Set<String> assignedBatches) { this.assignedBatches = assignedBatches; }
    }

    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private Role role;
        private Boolean active;
        private String panel;
        private String batch;
        private java.util.Set<String> assignedBatches;

        public UpdateUserRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }

        public String getPanel() { return panel; }
        public void setPanel(String panel) { this.panel = panel; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public java.util.Set<String> getAssignedBatches() { return assignedBatches; }
        public void setAssignedBatches(java.util.Set<String> assignedBatches) { this.assignedBatches = assignedBatches; }
    }

    public static class ToggleStatusRequest {
        private boolean active;

        public ToggleStatusRequest() {}
        public ToggleStatusRequest(boolean active) { this.active = active; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    public static class BulkSubjectEnrollmentRequest {
        private List<Long> studentIds;

        public BulkSubjectEnrollmentRequest() {}

        public List<Long> getStudentIds() { return studentIds; }
        public void setStudentIds(List<Long> studentIds) { this.studentIds = studentIds; }
    }

    public static class CreateSubjectAdminRequest {
        private String name;
        private String code;
        private Long instructorId;
        private String description;

        public CreateSubjectAdminRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public Long getInstructorId() { return instructorId; }
        public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class SystemStatsResponse {
        private long totalUsers;
        private long totalStudents;
        private long totalInstructors;
        private long totalAdmins;
        private long activeUsers;
        private long inactiveUsers;

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

    public static class BulkRowIssue {
        private int rowNumber;
        private String column;
        private String originalValue;
        private String currentValue;
        private String errorMessage;
        private String allowedFormat;
        private boolean fixed;
        private boolean ignored;

        private String fullName;
        private String email;
        private String role;
        private String panel;
        private String batch;
        private String assignedBatches;

        public BulkRowIssue() {}

        public int getRowNumber() { return rowNumber; }
        public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }

        public String getColumn() { return column; }
        public void setColumn(String column) { this.column = column; }

        public String getOriginalValue() { return originalValue; }
        public void setOriginalValue(String originalValue) { this.originalValue = originalValue; }

        public String getCurrentValue() { return currentValue; }
        public void setCurrentValue(String currentValue) { this.currentValue = currentValue; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public String getAllowedFormat() { return allowedFormat; }
        public void setAllowedFormat(String allowedFormat) { this.allowedFormat = allowedFormat; }

        public boolean isFixed() { return fixed; }
        public void setFixed(boolean fixed) { this.fixed = fixed; }

        public boolean isIgnored() { return ignored; }
        public void setIgnored(boolean ignored) { this.ignored = ignored; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getPanel() { return panel; }
        public void setPanel(String panel) { this.panel = panel; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public String getAssignedBatches() { return assignedBatches; }
        public void setAssignedBatches(String assignedBatches) { this.assignedBatches = assignedBatches; }
    }

    public static class BulkUploadValidationResponse {
        private int totalRows;
        private int validCount;
        private int issueCount;
        private List<CreateUserRequest> validRows;
        private List<BulkRowIssue> issues;

        public BulkUploadValidationResponse() {}

        public int getTotalRows() { return totalRows; }
        public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

        public int getValidCount() { return validCount; }
        public void setValidCount(int validCount) { this.validCount = validCount; }

        public int getIssueCount() { return issueCount; }
        public void setIssueCount(int issueCount) { this.issueCount = issueCount; }

        public List<CreateUserRequest> getValidRows() { return validRows; }
        public void setValidRows(List<CreateUserRequest> validRows) { this.validRows = validRows; }

        public List<BulkRowIssue> getIssues() { return issues; }
        public void setIssues(List<BulkRowIssue> issues) { this.issues = issues; }
    }

    public static class BulkImportProcessedRequest {
        private List<CreateUserRequest> users;

        public BulkImportProcessedRequest() {}

        public List<CreateUserRequest> getUsers() { return users; }
        public void setUsers(List<CreateUserRequest> users) { this.users = users; }
    }
}
