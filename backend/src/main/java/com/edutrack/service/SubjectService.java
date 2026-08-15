package com.edutrack.service;

import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.AuthDto;
import com.edutrack.dto.SubjectDto;
import com.edutrack.model.Role;
import com.edutrack.model.Subject;
import com.edutrack.model.User;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubjectRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;
    private final ValidationConfig validationConfig;
    private final PasswordEncoder passwordEncoder;

    public SubjectService(SubjectRepository subjectRepository, UserRepository userRepository, MilestoneRepository milestoneRepository, ValidationConfig validationConfig, PasswordEncoder passwordEncoder) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
        this.validationConfig = validationConfig;
        this.passwordEncoder = passwordEncoder;
    }

    public SubjectDto.SubjectResponse createSubject(SubjectDto.CreateSubjectRequest request, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        if (request.getName() == null || request.getName().trim().length() < validationConfig.getSubjectNameMin() || request.getName().trim().length() > validationConfig.getSubjectNameMax()) {
            throw new IllegalArgumentException("Subject name must be between " + validationConfig.getSubjectNameMin() + " and " + validationConfig.getSubjectNameMax() + " characters.");
        }
        if (request.getCode() == null || request.getCode().trim().length() < validationConfig.getSubjectCodeMin() || request.getCode().trim().length() > validationConfig.getSubjectCodeMax()) {
            throw new IllegalArgumentException("Subject code must be between " + validationConfig.getSubjectCodeMin() + " and " + validationConfig.getSubjectCodeMax() + " characters.");
        }
        if (request.getDescription() != null && request.getDescription().trim().length() > validationConfig.getSubjectDescriptionMax()) {
            throw new IllegalArgumentException("Subject description must not exceed " + validationConfig.getSubjectDescriptionMax() + " characters.");
        }

        Subject subject = new Subject(
                request.getName(),
                request.getCode(),
                instructor,
                request.getDescription()
        );

        Subject saved = subjectRepository.save(subject);
        return toSubjectResponse(saved);
    }

    public List<SubjectDto.SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toSubjectResponse)
                .collect(Collectors.toList());
    }

    public List<SubjectDto.SubjectResponse> getSubjectsByInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        return subjectRepository.findByInstructor(instructor).stream()
                .map(this::toSubjectResponse)
                .collect(Collectors.toList());
    }

    public List<SubjectDto.SubjectResponse> getSubjectsForStudentBatch(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Subject> enrolled = subjectRepository.findByEnrolledStudentsContaining(student);
        return enrolled.stream().map(this::toSubjectResponse).collect(Collectors.toList());
    }

    public SubjectDto.SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return toSubjectResponse(subject);
    }

    public AuthDto.UserDto addStudentToSubject(Long subjectId, String fullName, String email) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (email == null || !email.trim().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format for student: " + email);
        }

        String trimmedName = fullName != null ? fullName.trim() : "";
        long alphaCount = trimmedName.chars().filter(Character::isLetter).count();
        if (trimmedName.isEmpty() || !trimmedName.matches("^[a-zA-Z\\s.'-]+$") || alphaCount < 2) {
            throw new IllegalArgumentException("Invalid full name format: " + fullName);
        }

        User student = userRepository.findByEmail(email.trim()).orElse(null);
        if (student == null) {
            // Register new student account automatically
            student = new User(
                    email.trim(),
                    passwordEncoder.encode("student123"),
                    trimmedName,
                    Role.STUDENT
            );
            student.setNeedsPasswordReset(true);
        }

        User savedStudent = userRepository.save(student);

        // Add to subject's enrolled students set
        if (!subject.getEnrolledStudents().contains(savedStudent)) {
            subject.getEnrolledStudents().add(savedStudent);
            subjectRepository.save(subject);
        }

        return new AuthDto.UserDto(savedStudent.getId(), savedStudent.getEmail(), savedStudent.getFullName(), savedStudent.getRole(), savedStudent.isNeedsPasswordReset(), savedStudent.isActive());
    }

    public List<AuthDto.UserDto> getStudentsBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        return subject.getEnrolledStudents().stream()
                .map(u -> new AuthDto.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.isNeedsPasswordReset(), u.isActive()))
                .collect(Collectors.toList());
    }

    public SubjectDto.SubjectResponse toSubjectResponse(Subject subject) {
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
}
