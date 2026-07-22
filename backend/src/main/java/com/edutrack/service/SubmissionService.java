package com.edutrack.service;

import com.edutrack.dto.SubmissionDto;
import com.edutrack.model.*;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubmissionRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public SubmissionService(SubmissionRepository submissionRepository, MilestoneRepository milestoneRepository, UserRepository userRepository, FileStorageService fileStorageService) {
        this.submissionRepository = submissionRepository;
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public SubmissionDto.SubmissionResponse submitDeliverable(
            Long milestoneId,
            Long studentId,
            MultipartFile file,
            String submissionLink,
            String comments
    ) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if student already has a submission for this milestone
        Optional<Submission> existingOpt = submissionRepository.findByMilestoneAndStudent(milestone, student);
        Submission submission;

        if (existingOpt.isPresent()) {
            submission = existingOpt.get();
            if (submission.getStatus() == SubmissionStatus.APPROVED) {
                throw new RuntimeException("Submission for this milestone is already approved and cannot be modified.");
            }
        } else {
            submission = new Submission();
            submission.setMilestone(milestone);
            submission.setStudent(student);
        }

        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(file);
            submission.setFileUrl("/uploads/" + storedFileName);
        }

        if (submissionLink != null && !submissionLink.trim().isEmpty()) {
            submission.setSubmissionLink(submissionLink.trim());
        }

        submission.setComments(comments);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setFinalPoints(0.0); // Reset until approved

        // Calculate Timeliness Multiplier
        double timelinessMultiplier = calculateTimelinessMultiplier(submission.getSubmittedAt(), milestone.getDeadline());
        submission.setTimelinessMultiplier(timelinessMultiplier);

        Submission saved = submissionRepository.save(submission);
        return toSubmissionResponse(saved);
    }

    public SubmissionDto.SubmissionResponse reviewSubmission(Long submissionId, SubmissionDto.ReviewSubmissionRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setStatus(request.getStatus());
        submission.setInstructorFeedback(request.getFeedback());
        submission.setReviewedAt(LocalDateTime.now());

        if (request.getStatus() == SubmissionStatus.APPROVED) {
            int qualityRating = request.getQualityRating() != null ? Math.max(1, Math.min(5, request.getQualityRating())) : 5;
            submission.setQualityRating(qualityRating);

            double basePoints = submission.getMilestone().getBasePoints();
            double timelinessMultiplier = submission.getTimelinessMultiplier() != null ? submission.getTimelinessMultiplier() : 1.0;
            
            // SRS Formula: Base Points * Timeliness Multiplier * (Quality Rating / 5.0)
            double finalPoints = basePoints * timelinessMultiplier * (qualityRating / 5.0);
            submission.setFinalPoints(Math.round(finalPoints * 100.0) / 100.0);
        } else {
            submission.setFinalPoints(0.0);
        }

        Submission updated = submissionRepository.save(submission);
        return toSubmissionResponse(updated);
    }

    public List<SubmissionDto.SubmissionResponse> getSubmissionsByMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        return submissionRepository.findByMilestone(milestone).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionDto.SubmissionResponse> getSubmissionsByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return submissionRepository.findByStudent(student).stream()
                .map(this::toSubmissionResponse)
                .collect(Collectors.toList());
    }

    public SubmissionDto.SubmissionResponse getSubmissionForMilestoneAndStudent(Long milestoneId, Long studentId) {
        Milestone milestone = milestoneRepository.findById(milestoneId).orElse(null);
        User student = userRepository.findById(studentId).orElse(null);

        if (milestone == null || student == null) return null;

        return submissionRepository.findByMilestoneAndStudent(milestone, student)
                .map(this::toSubmissionResponse)
                .orElse(null);
    }

    private double calculateTimelinessMultiplier(LocalDateTime submittedAt, LocalDateTime deadline) {
        if (submittedAt.isBefore(deadline.minusHours(24))) {
            return 1.2; // Early submission (>= 24 hours before deadline)
        } else if (!submittedAt.isAfter(deadline)) {
            return 1.0; // On-time submission
        } else {
            return 0.5; // Late submission
        }
    }

    public SubmissionDto.SubmissionResponse toSubmissionResponse(Submission submission) {
        SubmissionDto.SubmissionResponse response = new SubmissionDto.SubmissionResponse();
        response.setId(submission.getId());
        response.setMilestoneId(submission.getMilestone().getId());
        response.setMilestoneTitle(submission.getMilestone().getTitle());
        response.setStudentId(submission.getStudent().getId());
        response.setStudentName(submission.getStudent().getFullName());
        response.setStudentEmail(submission.getStudent().getEmail());
        response.setFileUrl(submission.getFileUrl());
        response.setSubmissionLink(submission.getSubmissionLink());
        response.setComments(submission.getComments());
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setStatus(submission.getStatus());
        response.setQualityRating(submission.getQualityRating());
        response.setTimelinessMultiplier(submission.getTimelinessMultiplier());
        response.setFinalPoints(submission.getFinalPoints());
        response.setInstructorFeedback(submission.getInstructorFeedback());
        response.setReviewedAt(submission.getReviewedAt());
        return response;
    }
}
