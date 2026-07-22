package com.edutrack.service;

import com.edutrack.dto.SubjectDto;
import com.edutrack.model.Batch;
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

        if (student.getBatch() == null) {
            return List.of();
        }

        return subjectRepository.findByBatch(student.getBatch()).stream()
                .map(this::toSubjectResponse)
                .collect(Collectors.toList());
    }

    public SubjectDto.SubjectResponse getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return toSubjectResponse(subject);
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
