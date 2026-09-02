package com.edutrack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean needsPasswordReset = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "student_panel")
    private String panel;

    @Column(name = "student_batch")
    private String batch;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "instructor_assigned_batches", joinColumns = @JoinColumn(name = "instructor_id"))
    @Column(name = "batch")
    private java.util.Set<String> assignedBatches = new java.util.HashSet<>();

    public User() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    public User(String email, String password, String fullName, Role role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isNeedsPasswordReset() { return needsPasswordReset; }
    public void setNeedsPasswordReset(boolean needsPasswordReset) { this.needsPasswordReset = needsPasswordReset; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : getClass().hashCode();
    }

    public String getPanel() { return panel; }
    public void setPanel(String panel) { this.panel = panel; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public java.util.Set<String> getAssignedBatches() { return assignedBatches; }
    public void setAssignedBatches(java.util.Set<String> assignedBatches) { this.assignedBatches = assignedBatches; }
}
