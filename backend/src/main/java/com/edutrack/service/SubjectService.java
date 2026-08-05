package com.edutrack.service;

import com.edutrack.dto.AuthDto;
import com.edutrack.dto.SubjectDto;
import com.edutrack.model.Batch;
import com.edutrack.model.Role;
import com.edutrack.model.Subject;
import com.edutrack.model.User;
import com.edutrack.repository.BatchRepository;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubjectRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final MilestoneRepository milestoneRepository;

    public SubjectService(SubjectRepository subjectRepository, UserRepository userRepository, BatchRepository batchRepository, MilestoneRepository milestoneRepository) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.milestoneRepository = milestoneRepository;
    }

    public SubjectDto.SubjectResponse createSubject(SubjectDto.CreateSubjectRequest request, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Subject subject = new Subject(
                request.getName(),
                request.getCode(),
                instructor,
                batch,
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

        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null) {
            // Register new student account automatically
            student = new User(
                    email,
                    "$2a$10$E2UPv7arXnm8j.JtY8Z9k.kZ8yGvR7O3q6v5F6E3q6v5F6E3q6v5F", // BCrypt encoded "student123"
                    fullName,
                    Role.STUDENT,
                    subject.getBatch()
            );
        } else {
            student.setBatch(subject.getBatch());
        }

        User savedStudent = userRepository.save(student);

        // Add to subject's enrolled students set
        if (!subject.getEnrolledStudents().contains(savedStudent)) {
            subject.getEnrolledStudents().add(savedStudent);
            subjectRepository.save(subject);
        }

        return new AuthDto.UserDto(savedStudent.getId(), savedStudent.getEmail(), savedStudent.getFullName(), savedStudent.getRole(), subject.getBatch().getId(), subject.getBatch().getName());
    }

    public List<AuthDto.UserDto> getStudentsBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (!subject.getEnrolledStudents().isEmpty()) {
            return subject.getEnrolledStudents().stream()
                    .map(u -> new AuthDto.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), subject.getBatch() != null ? subject.getBatch().getId() : null, subject.getBatch() != null ? subject.getBatch().getName() : "N/A"))
                    .collect(Collectors.toList());
        }

        if (subject.getBatch() == null) return List.of();

        return userRepository.findByBatchIdAndRole(subject.getBatch().getId(), Role.STUDENT).stream()
                .map(u -> new AuthDto.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), subject.getBatch().getId(), subject.getBatch().getName()))
                .collect(Collectors.toList());
    }

    public SubjectDto.SubjectResponse toSubjectResponse(Subject subject) {
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
}
