package com.edutrack.service;

import com.edutrack.dto.MilestoneDto;
import com.edutrack.model.Milestone;
import com.edutrack.model.Subject;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubjectRepository;
import com.edutrack.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final SubjectRepository subjectRepository;
    private final SubmissionRepository submissionRepository;

    public MilestoneService(MilestoneRepository milestoneRepository, SubjectRepository subjectRepository, SubmissionRepository submissionRepository) {
        this.milestoneRepository = milestoneRepository;
        this.subjectRepository = subjectRepository;
        this.submissionRepository = submissionRepository;
    }

    public MilestoneDto.MilestoneResponse createMilestone(MilestoneDto.CreateMilestoneRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        LocalDateTime deadline = LocalDateTime.parse(request.getDeadline());

        Milestone milestone = new Milestone(
                subject,
                request.getTitle(),
                request.getDescription(),
                deadline,
                request.getBasePoints() != null ? request.getBasePoints() : 100.0,
                request.getRequiredDeliverables(),
                request.getIsMandatory() != null ? request.getIsMandatory() : true
        );

        Milestone saved = milestoneRepository.save(milestone);
        return toMilestoneResponse(saved);
    }

    public MilestoneDto.MilestoneResponse updateMilestone(Long id, MilestoneDto.CreateMilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        if (request.getTitle() != null) milestone.setTitle(request.getTitle());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        if (request.getDeadline() != null) milestone.setDeadline(LocalDateTime.parse(request.getDeadline()));
        if (request.getBasePoints() != null) milestone.setBasePoints(request.getBasePoints());
        if (request.getRequiredDeliverables() != null) milestone.setRequiredDeliverables(request.getRequiredDeliverables());
        if (request.getIsMandatory() != null) milestone.setIsMandatory(request.getIsMandatory());

        Milestone updated = milestoneRepository.save(milestone);
        return toMilestoneResponse(updated);
    }

    public List<MilestoneDto.MilestoneResponse> getMilestonesBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        return milestoneRepository.findBySubjectOrderByDeadlineAsc(subject).stream()
                .map(this::toMilestoneResponse)
                .collect(Collectors.toList());
    }

    public MilestoneDto.MilestoneResponse getMilestoneById(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        return toMilestoneResponse(milestone);
    }

    @Transactional
    public void deleteMilestone(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        submissionRepository.deleteByMilestone(milestone);
        milestoneRepository.delete(milestone);
    }

    public MilestoneDto.MilestoneResponse toMilestoneResponse(Milestone milestone) {
        MilestoneDto.MilestoneResponse response = new MilestoneDto.MilestoneResponse();
        response.setId(milestone.getId());
        response.setSubjectId(milestone.getSubject().getId());
        response.setSubjectName(milestone.getSubject().getName());
        response.setTitle(milestone.getTitle());
        response.setDescription(milestone.getDescription());
        response.setDeadline(milestone.getDeadline());
        response.setBasePoints(milestone.getBasePoints());
        response.setRequiredDeliverables(milestone.getRequiredDeliverables());
        response.setIsMandatory(milestone.getIsMandatory() != null ? milestone.getIsMandatory() : true);
        response.setIsOverdue(LocalDateTime.now().isAfter(milestone.getDeadline()));
        return response;
    }
}
