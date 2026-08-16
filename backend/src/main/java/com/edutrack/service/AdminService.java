package com.edutrack.service;

import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.AdminDto;
import com.edutrack.dto.SubjectDto;
import com.edutrack.model.*;
import com.edutrack.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final MilestoneRepository milestoneRepository;
    private final SubmissionRepository submissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final ValidationConfig validationConfig;

    public AdminService(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            MilestoneRepository milestoneRepository,
            SubmissionRepository submissionRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder,
            ValidationConfig validationConfig
    ) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.milestoneRepository = milestoneRepository;
        this.submissionRepository = submissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.validationConfig = validationConfig;
    }

    private void writeAuditLog(String action, String details) {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String performer = (auth != null) ? auth.getName() : "system@edutrack.edu";
        AuditLog log = new AuditLog(action, details, performer);
        auditLogRepository.save(log);
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    @Transactional(readOnly = true)
    public List<AdminDto.AdminUserResponse> getAllUsers(String search, Role role, Boolean active) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> {
                    if (role != null && u.getRole() != role) return false;
                    if (active != null && u.isActive() != active) return false;
                    if (search != null && !search.trim().isEmpty()) {
                        String query = search.trim().toLowerCase();
                        boolean matchesName = u.getFullName() != null && u.getFullName().toLowerCase().contains(query);
                        boolean matchesEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(query);
                        if (!matchesName && !matchesEmail) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    public AdminDto.AdminUserResponse createUser(AdminDto.CreateUserRequest request) {
        if (request.getEmail() == null || !request.getEmail().trim().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("Valid email is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email '" + email + "' already exists.");
        }

        String trimmedName = request.getFullName() != null ? request.getFullName().trim() : "";
        if (trimmedName.length() < validationConfig.getUserFullnameMin() || trimmedName.length() > validationConfig.getUserFullnameMax()) {
            throw new IllegalArgumentException("Full name must be between " + validationConfig.getUserFullnameMin() + " and " + validationConfig.getUserFullnameMax() + " characters.");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        boolean defaultPassUsed = false;
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            defaultPassUsed = true;
            rawPassword = (role == Role.STUDENT) ? "student123" : (role == Role.INSTRUCTOR ? "prof123" : "admin123");
        } else if (rawPassword.length() < validationConfig.getUserPasswordMin() || rawPassword.length() > validationConfig.getUserPasswordMax()) {
            throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
        }

        User user = new User(email, passwordEncoder.encode(rawPassword), trimmedName, role);
        user.setNeedsPasswordReset(defaultPassUsed);
        user.setActive(true);

        User saved = userRepository.save(user);
        writeAuditLog("USER_CREATE", "Created user account: " + saved.getFullName() + " (" + saved.getEmail() + ") with role: " + saved.getRole());
        return toAdminUserResponse(saved);
    }

    public AdminDto.AdminUserResponse updateUser(Long id, AdminDto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().trim().equalsIgnoreCase(user.getEmail())) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                throw new IllegalArgumentException("Invalid email format.");
            }
            if (userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email '" + newEmail + "' is already in use by another account.");
            }
            user.setEmail(newEmail);
        }

        if (request.getFullName() != null) {
            String trimmedName = request.getFullName().trim();
            if (trimmedName.length() < validationConfig.getUserFullnameMin() || trimmedName.length() > validationConfig.getUserFullnameMax()) {
                throw new IllegalArgumentException("Full name must be between " + validationConfig.getUserFullnameMin() + " and " + validationConfig.getUserFullnameMax() + " characters.");
            }
            user.setFullName(trimmedName);
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            String newPass = request.getPassword().trim();
            if (newPass.length() < validationConfig.getUserPasswordMin() || newPass.length() > validationConfig.getUserPasswordMax()) {
                throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
            }
            user.setPassword(passwordEncoder.encode(newPass));
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updated = userRepository.save(user);
        writeAuditLog("USER_UPDATE", "Updated details for user: " + updated.getFullName() + " (" + updated.getEmail() + ")");
        return toAdminUserResponse(updated);
    }

    public AdminDto.AdminUserResponse toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + id));

        user.setActive(active);
        User updated = userRepository.save(user);
        writeAuditLog("USER_TOGGLE_STATUS", "Changed status of user: " + updated.getFullName() + " (" + updated.getEmail() + ") to " + (updated.isActive() ? "ACTIVE" : "INACTIVE"));
        return toAdminUserResponse(updated);
    }

    public List<AdminDto.AdminUserResponse> bulkUploadUsers(MultipartFile file, Role defaultRole) {
        List<AdminDto.AdminUserResponse> responses = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header line
                }
                
                String[] parts = line.split(",");
                if (parts.length < 2) continue;
                
                String fullName = parts[0].replaceAll("^\"|\"$", "").trim();
                String email = parts[1].replaceAll("^\"|\"$", "").trim();
                
                Role role = defaultRole;
                if (parts.length >= 3) {
                    String roleStr = parts[2].replaceAll("^\"|\"$", "").trim().toUpperCase();
                    try {
                        role = Role.valueOf(roleStr);
                    } catch (IllegalArgumentException e) {
                        // Keep defaultRole
                    }
                }
                
                AdminDto.CreateUserRequest request = new AdminDto.CreateUserRequest();
                request.setFullName(fullName);
                request.setEmail(email);
                request.setRole(role);
                
                try {
                    responses.add(createUser(request));
                } catch (Exception e) {
                    System.err.println("Failed to import user " + email + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }
        
        writeAuditLog("USER_BULK_UPLOAD", "Uploaded batch file containing " + responses.size() + " accounts under role: " + defaultRole);
        return responses;
    }

    // ==========================================
    // SUBJECT ENROLLMENT & CREATION
    // ==========================================

    public void enrollStudentInSubject(Long subjectId, Long studentId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found with ID: " + studentId));

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        if (!subject.getEnrolledStudents().contains(student)) {
            subject.getEnrolledStudents().add(student);
            subjectRepository.save(subject);
            writeAuditLog("STUDENT_ENROLL", "Enrolled student " + student.getFullName() + " into course " + subject.getName());
        }
    }

    public void unenrollStudentFromSubject(Long subjectId, Long studentId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));
        User student = userRepository.findById(studentId).orElse(null);

        if (subject.getEnrolledStudents() != null) {
            subject.getEnrolledStudents().removeIf(u -> u.getId() != null && u.getId().equals(studentId));
            subjectRepository.save(subject);
            String studentName = student != null ? student.getFullName() : "ID: " + studentId;
            writeAuditLog("STUDENT_UNENROLL", "Unenrolled student " + studentName + " from course " + subject.getName());
        }
    }

    public void bulkEnrollStudentsInSubject(Long subjectId, List<Long> studentIds) {
        if (studentIds == null || studentIds.isEmpty()) return;

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        int count = 0;
        for (Long studentId : studentIds) {
            User student = userRepository.findById(studentId).orElse(null);
            if (student != null) {
                subject.getEnrolledStudents().add(student);
                count++;
            }
        }
        subjectRepository.save(subject);
        writeAuditLog("STUDENT_BULK_ENROLL", "Bulk enrolled " + count + " students into course " + subject.getName());
    }

    public SubjectDto.SubjectResponse createSubjectByAdmin(AdminDto.CreateSubjectAdminRequest request) {
        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new NoSuchElementException("Instructor not found with ID: " + request.getInstructorId()));

        if (request.getName() == null || request.getName().trim().length() < validationConfig.getSubjectNameMin() || request.getName().trim().length() > validationConfig.getSubjectNameMax()) {
            throw new IllegalArgumentException("Subject name must be between " + validationConfig.getSubjectNameMin() + " and " + validationConfig.getSubjectNameMax() + " characters.");
        }
        if (request.getCode() == null || request.getCode().trim().length() < validationConfig.getSubjectCodeMin() || request.getCode().trim().length() > validationConfig.getSubjectCodeMax()) {
            throw new IllegalArgumentException("Subject code must be between " + validationConfig.getSubjectCodeMin() + " and " + validationConfig.getSubjectCodeMax() + " characters.");
        }

        String code = request.getCode().trim();
        if (subjectRepository.findByCode(code).isPresent()) {
            throw new IllegalArgumentException("Subject with course code '" + code + "' already exists.");
        }

        Subject subject = new Subject(
                request.getName().trim(),
                code,
                instructor,
                request.getDescription() != null ? request.getDescription().trim() : ""
        );

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        Subject saved = subjectRepository.save(subject);
        writeAuditLog("SUBJECT_CREATE", "Created lab class: " + saved.getName() + " (" + saved.getCode() + ") assigned to instructor: " + instructor.getFullName());
        return toSubjectResponse(saved);
    }

    public SubjectDto.SubjectResponse changeSubjectInstructor(Long subjectId, Long instructorId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new NoSuchElementException("Instructor not found with ID: " + instructorId));

        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("Target user is not a faculty instructor.");
        }

        User oldInstructor = subject.getInstructor();
        subject.setInstructor(instructor);
        Subject saved = subjectRepository.save(subject);

        String oldName = oldInstructor != null ? oldInstructor.getFullName() : "None";
        writeAuditLog("SUBJECT_INSTRUCTOR_CHANGE", "Changed instructor of subject " + subject.getName() + " (" + subject.getCode() + ") from " + oldName + " to " + instructor.getFullName());
        return toSubjectResponse(saved);
    }

    private SubjectDto.SubjectResponse toSubjectResponse(Subject subject) {
        SubjectDto.SubjectResponse response = new SubjectDto.SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setCode(subject.getCode());
        response.setInstructorName(subject.getInstructor() != null ? subject.getInstructor().getFullName() : "N/A");
        response.setInstructorId(subject.getInstructor() != null ? subject.getInstructor().getId() : null);
        response.setDescription(subject.getDescription());

        Long count = milestoneRepository.countBySubject(subject);
        response.setTotalMilestones(count != null ? count.intValue() : 0);
        response.setEnrolledStudentsCount(subject.getEnrolledStudents() != null ? subject.getEnrolledStudents().size() : 0);
        return response;
    }

    // ==========================================
    // SYSTEM STATS, LOGS & REPORTS
    // ==========================================

    @Transactional(readOnly = true)
    public AdminDto.SystemStatsResponse getSystemStats() {
        AdminDto.SystemStatsResponse stats = new AdminDto.SystemStatsResponse();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        stats.setTotalInstructors(userRepository.countByRole(Role.INSTRUCTOR));
        stats.setTotalAdmins(userRepository.countByRole(Role.ADMIN));
        stats.setActiveUsers(userRepository.countByActive(true));
        stats.setInactiveUsers(userRepository.countByActive(false));

        stats.setTotalSubjects(subjectRepository.count());
        stats.setTotalMilestones(milestoneRepository.count());
        stats.setTotalSubmissions(submissionRepository.count());

        stats.setSubmissionsApproved(submissionRepository.countByStatus(SubmissionStatus.APPROVED));
        stats.setSubmissionsSubmitted(submissionRepository.countByStatus(SubmissionStatus.SUBMITTED));
        stats.setSubmissionsNeedsRevision(submissionRepository.countByStatus(SubmissionStatus.NEEDS_REVISION));
        stats.setSubmissionsOverdue(submissionRepository.countByStatus(SubmissionStatus.OVERDUE));

        return stats;
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size)).getContent();
    }

    // ==========================================
    // HELPER MAPPERS
    // ==========================================

    private AdminDto.AdminUserResponse toAdminUserResponse(User user) {
        int associatedCount = 0;
        if (user.getRole() == Role.STUDENT) {
            associatedCount = subjectRepository.findByEnrolledStudentsContaining(user).size();
        } else if (user.getRole() == Role.INSTRUCTOR) {
            associatedCount = subjectRepository.findByInstructor(user).size();
        }

        return new AdminDto.AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.isNeedsPasswordReset(),
                user.getCreatedAt(),
                associatedCount
        );
    }
}
