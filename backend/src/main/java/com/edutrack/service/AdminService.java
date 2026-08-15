package com.edutrack.service;

import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.AdminDto;
import com.edutrack.dto.SubjectDto;
import com.edutrack.model.*;
import com.edutrack.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final SubjectRepository subjectRepository;
    private final MilestoneRepository milestoneRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ValidationConfig validationConfig;

    public AdminService(
            UserRepository userRepository,
            BatchRepository batchRepository,
            SubjectRepository subjectRepository,
            MilestoneRepository milestoneRepository,
            SubmissionRepository submissionRepository,
            PasswordEncoder passwordEncoder,
            ValidationConfig validationConfig
    ) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.subjectRepository = subjectRepository;
        this.milestoneRepository = milestoneRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.validationConfig = validationConfig;
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
                        boolean matchesBatch = u.getBatch() != null && u.getBatch().getName() != null && u.getBatch().getName().toLowerCase().contains(query);
                        if (!matchesName && !matchesEmail && !matchesBatch) return false;
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

        Batch batch = null;
        if (request.getBatchId() != null && request.getBatchId() > 0) {
            batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected Batch ID not found."));
        }

        boolean defaultPassUsed = false;
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            defaultPassUsed = true;
            rawPassword = (role == Role.STUDENT) ? "student123" : (role == Role.INSTRUCTOR ? "prof123" : "admin123");
        } else if (rawPassword.length() < validationConfig.getUserPasswordMin() || rawPassword.length() > validationConfig.getUserPasswordMax()) {
            throw new IllegalArgumentException("Password must be between " + validationConfig.getUserPasswordMin() + " and " + validationConfig.getUserPasswordMax() + " characters.");
        }

        User user = new User(email, passwordEncoder.encode(rawPassword), trimmedName, role, batch);
        user.setNeedsPasswordReset(defaultPassUsed);
        user.setActive(true);

        User saved = userRepository.save(user);
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

        if (request.getBatchId() != null) {
            if (request.getBatchId() <= 0) {
                user.setBatch(null);
            } else {
                Batch batch = batchRepository.findById(request.getBatchId())
                        .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + request.getBatchId()));
                user.setBatch(batch);
            }
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
        return toAdminUserResponse(updated);
    }

    public AdminDto.AdminUserResponse toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + id));

        user.setActive(active);
        User updated = userRepository.save(user);
        return toAdminUserResponse(updated);
    }

    // ==========================================
    // BATCH MANAGEMENT & MAPPINGS
    // ==========================================

    @Transactional(readOnly = true)
    public List<AdminDto.BatchResponse> getAllBatches() {
        List<Batch> batches = batchRepository.findAll();
        return batches.stream().map(batch -> {
            int studentCount = (int) userRepository.findByBatch(batch).stream().filter(u -> u.getRole() == Role.STUDENT).count();
            int subjectCount = subjectRepository.findByBatch(batch).size();
            return new AdminDto.BatchResponse(batch.getId(), batch.getName(), batch.getAcademicYear(), studentCount, subjectCount);
        }).collect(Collectors.toList());
    }

    public AdminDto.BatchResponse createBatch(AdminDto.CreateBatchRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Batch name is required.");
        }
        String batchName = request.getName().trim();
        if (batchRepository.existsByName(batchName)) {
            throw new IllegalArgumentException("Batch '" + batchName + "' already exists.");
        }

        Batch batch = new Batch(batchName, request.getAcademicYear() != null ? request.getAcademicYear().trim() : null);
        Batch saved = batchRepository.save(batch);
        return new AdminDto.BatchResponse(saved.getId(), saved.getName(), saved.getAcademicYear(), 0, 0);
    }

    public AdminDto.AdminUserResponse assignStudentToBatch(Long studentId, Long batchId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found with ID: " + studentId));

        if (batchId == null || batchId <= 0) {
            student.setBatch(null);
        } else {
            Batch batch = batchRepository.findById(batchId)
                    .orElseThrow(() -> new NoSuchElementException("Batch not found with ID: " + batchId));
            student.setBatch(batch);
        }

        User updated = userRepository.save(student);
        return toAdminUserResponse(updated);
    }

    public void bulkAssignStudentsToBatch(AdminDto.BulkAssignBatchRequest request) {
        if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            return;
        }

        Batch batch = null;
        if (request.getBatchId() != null && request.getBatchId() > 0) {
            batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new NoSuchElementException("Batch not found with ID: " + request.getBatchId()));
        }

        for (Long studentId : request.getStudentIds()) {
            User student = userRepository.findById(studentId).orElse(null);
            if (student != null) {
                student.setBatch(batch);
                userRepository.save(student);
            }
        }
    }

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
        }
    }

    public void unenrollStudentFromSubject(Long subjectId, Long studentId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));

        if (subject.getEnrolledStudents() != null) {
            subject.getEnrolledStudents().removeIf(u -> u.getId() != null && u.getId().equals(studentId));
            subjectRepository.save(subject);
        }
    }

    public void bulkEnrollStudentsInSubject(Long subjectId, List<Long> studentIds) {
        if (studentIds == null || studentIds.isEmpty()) return;

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        for (Long studentId : studentIds) {
            User student = userRepository.findById(studentId).orElse(null);
            if (student != null) {
                subject.getEnrolledStudents().add(student);
            }
        }
        subjectRepository.save(subject);
    }

    public SubjectDto.SubjectResponse assignSubjectToBatch(Long subjectId, Long batchId, boolean autoEnrollBatchStudents) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new NoSuchElementException("Batch not found with ID: " + batchId));

        subject.setBatch(batch);

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        if (autoEnrollBatchStudents) {
            List<User> batchStudents = userRepository.findByBatch(batch);
            for (User student : batchStudents) {
                if (student.getRole() == Role.STUDENT && student.isActive()) {
                    subject.getEnrolledStudents().add(student);
                }
            }
        }

        Subject saved = subjectRepository.save(subject);
        return toSubjectResponse(saved);
    }

    public SubjectDto.SubjectResponse autoEnrollBatchStudentsInSubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new NoSuchElementException("Subject not found with ID: " + subjectId));

        if (subject.getBatch() != null) {
            if (subject.getEnrolledStudents() == null) {
                subject.setEnrolledStudents(new HashSet<>());
            }
            List<User> batchStudents = userRepository.findByBatch(subject.getBatch());
            for (User student : batchStudents) {
                if (student.getRole() == Role.STUDENT && student.isActive()) {
                    subject.getEnrolledStudents().add(student);
                }
            }
            subjectRepository.save(subject);
        }

        return toSubjectResponse(subject);
    }

    public SubjectDto.SubjectResponse createSubjectByAdmin(AdminDto.CreateSubjectAdminRequest request) {
        User instructor = userRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new NoSuchElementException("Instructor not found with ID: " + request.getInstructorId()));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new NoSuchElementException("Batch not found with ID: " + request.getBatchId()));

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
                batch,
                request.getDescription() != null ? request.getDescription().trim() : ""
        );

        if (subject.getEnrolledStudents() == null) {
            subject.setEnrolledStudents(new HashSet<>());
        }

        if (request.isAutoEnrollBatchStudents()) {
            List<User> batchStudents = userRepository.findByBatch(batch);
            for (User student : batchStudents) {
                if (student.getRole() == Role.STUDENT && student.isActive()) {
                    subject.getEnrolledStudents().add(student);
                }
            }
        }

        Subject saved = subjectRepository.save(subject);
        return toSubjectResponse(saved);
    }

    private SubjectDto.SubjectResponse toSubjectResponse(Subject subject) {
        SubjectDto.SubjectResponse response = new SubjectDto.SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setCode(subject.getCode());
        response.setInstructorName(subject.getInstructor() != null ? subject.getInstructor().getFullName() : "N/A");
        response.setInstructorId(subject.getInstructor() != null ? subject.getInstructor().getId() : null);
        response.setBatchName(subject.getBatch() != null ? subject.getBatch().getName() : "N/A");
        response.setBatchId(subject.getBatch() != null ? subject.getBatch().getId() : null);
        response.setDescription(subject.getDescription());

        Long count = milestoneRepository.countBySubject(subject);
        response.setTotalMilestones(count != null ? count.intValue() : 0);
        return response;
    }

    // ==========================================
    // SYSTEM STATS & REPORTS
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

        stats.setTotalBatches(batchRepository.count());
        stats.setTotalSubjects(subjectRepository.count());
        stats.setTotalMilestones(milestoneRepository.count());
        stats.setTotalSubmissions(submissionRepository.count());

        stats.setSubmissionsApproved(submissionRepository.countByStatus(SubmissionStatus.APPROVED));
        stats.setSubmissionsSubmitted(submissionRepository.countByStatus(SubmissionStatus.SUBMITTED));
        stats.setSubmissionsNeedsRevision(submissionRepository.countByStatus(SubmissionStatus.NEEDS_REVISION));
        stats.setSubmissionsOverdue(submissionRepository.countByStatus(SubmissionStatus.OVERDUE));

        return stats;
    }

    // ==========================================
    // HELPER MAPPERS
    // ==========================================

    private AdminDto.AdminUserResponse toAdminUserResponse(User user) {
        Long batchId = user.getBatch() != null ? user.getBatch().getId() : null;
        String batchName = user.getBatch() != null ? user.getBatch().getName() : null;

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
                batchId,
                batchName,
                user.isActive(),
                user.isNeedsPasswordReset(),
                user.getCreatedAt(),
                associatedCount
        );
    }
}
