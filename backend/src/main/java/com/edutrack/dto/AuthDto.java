package com.edutrack.dto;

import com.edutrack.model.Role;

public class AuthDto {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private Role role;

        public RegisterRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private UserDto user;

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }

    public static class UserDto {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private boolean needsPasswordReset;
        private boolean active = true;
        private String panel;
        private String batch;
        private java.util.Set<String> assignedBatches;

        public UserDto() {}

        public UserDto(Long id, String email, String fullName, Role role, boolean needsPasswordReset) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.needsPasswordReset = needsPasswordReset;
            this.active = true;
        }

        public UserDto(Long id, String email, String fullName, Role role, boolean needsPasswordReset, boolean active) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.needsPasswordReset = needsPasswordReset;
            this.active = active;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public boolean isNeedsPasswordReset() { return needsPasswordReset; }
        public void setNeedsPasswordReset(boolean needsPasswordReset) { this.needsPasswordReset = needsPasswordReset; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public String getPanel() { return panel; }
        public void setPanel(String panel) { this.panel = panel; }

        public String getBatch() { return batch; }
        public void setBatch(String batch) { this.batch = batch; }

        public java.util.Set<String> getAssignedBatches() { return assignedBatches; }
        public void setAssignedBatches(java.util.Set<String> assignedBatches) { this.assignedBatches = assignedBatches; }

        public static UserDto fromUser(com.edutrack.model.User user) {
            UserDto dto = new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isNeedsPasswordReset(), user.isActive());
            dto.setPanel(user.getPanel());
            dto.setBatch(user.getBatch());
            dto.setAssignedBatches(user.getAssignedBatches());
            return dto;
        }
    }

    public static class ChangePasswordRequest {
        private Long userId;
        private String newPassword;

        public ChangePasswordRequest() {}

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        private String newPassword;

        public ForgotPasswordRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
