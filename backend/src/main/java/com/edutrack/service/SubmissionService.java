package com.edutrack.service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.edutrack.config.ValidationConfig;
import com.edutrack.dto.SubmissionDto;
import com.edutrack.model.Milestone;
import com.edutrack.model.Subject;
import com.edutrack.model.Submission;
import com.edutrack.model.SubmissionStatus;
import com.edutrack.model.User;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubmissionRepository;
import com.edutrack.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SubmissionService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ValidationConfig validationConfig;

    public SubmissionService(SubmissionRepository submissionRepository, MilestoneRepository milestoneRepository, UserRepository userRepository, FileStorageService fileStorageService, ValidationConfig validationConfig) {
        this.submissionRepository = submissionRepository;
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.validationConfig = validationConfig;
    }

    public SubmissionDto.SubmissionResponse submitDeliverable(
            Long milestoneId,
            Long studentId,
            MultipartFile file,
            String submissionLink,
            Integer deliverableIndex,
            String comments
    ) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (submissionLink != null && submissionLink.trim().length() > validationConfig.getSubmissionLinkMax()) {
            throw new IllegalArgumentException("Submission link must not exceed " + validationConfig.getSubmissionLinkMax() + " characters.");
        }
        if (submissionLink != null && !submissionLink.trim().isEmpty() && !isValidSubmissionLink(submissionLink.trim())) {
            throw new IllegalArgumentException("Submission link must be a valid URL.");
        }
        if (comments != null && comments.trim().length() > validationConfig.getSubmissionCommentsMax()) {
            throw new IllegalArgumentException("Comments must not exceed " + validationConfig.getSubmissionCommentsMax() + " characters.");
        }
        if (file != null && !file.isEmpty() && file.getSize() > validationConfig.getSubmissionFileMaxBytes()) {
            throw new IllegalArgumentException("File size exceeded. Max allowed size is " + readableBytes(validationConfig.getSubmissionFileMaxBytes()) + ".");
        }

        JsonNode selectedDeliverable = getSelectedDeliverableConfig(milestone.getRequiredDeliverables(), deliverableIndex);
        validateTeacherDefinedFormat(file, submissionLink, selectedDeliverable);

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

        if (submissionLink != null) {
            submission.setSubmissionLink(submissionLink.trim().isEmpty() ? null : submissionLink.trim());
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

    private JsonNode getSelectedDeliverableConfig(String requiredDeliverables, Integer deliverableIndex) {
        if (requiredDeliverables == null || requiredDeliverables.isBlank()) return null;

        try {
            JsonNode root = OBJECT_MAPPER.readTree(requiredDeliverables);
            if (!root.isArray() || root.size() == 0) return null;

            int resolvedIndex;
            if (deliverableIndex == null && root.size() == 1) {
                resolvedIndex = 0;
            } else if (deliverableIndex != null && deliverableIndex >= 0 && deliverableIndex < root.size()) {
                resolvedIndex = deliverableIndex;
            } else {
                return null;
            }

            JsonNode node = root.get(resolvedIndex);
            return node != null && node.isObject() ? node : null;
        } catch (IOException ignored) {
            return null;
        }
    }

    private void validateTeacherDefinedFormat(MultipartFile file, String submissionLink, JsonNode deliverableConfig) {
        if (deliverableConfig == null) return;

        boolean acceptsFile = deliverableConfig.path("acceptsFile").asBoolean(true);
        boolean acceptsLink = deliverableConfig.path("acceptsLink").asBoolean(true);

        if (file != null && !file.isEmpty()) {
            if (!acceptsFile) {
                throw new IllegalArgumentException("File uploads are not accepted for this deliverable.");
            }
            List<String> allowedFileExtensions = parseCsv(deliverableConfig.path("allowedFileExtensions").asText(""));
            if (!allowedFileExtensions.isEmpty()) {
                String extension = extractExtension(file.getOriginalFilename());
                if (extension.isBlank() || !allowedFileExtensions.contains(extension.toLowerCase())) {
                    throw new IllegalArgumentException("File format is not allowed by teacher. Allowed file formats: " + String.join(", ", allowedFileExtensions) + ".");
                }
            }
        }

        if (submissionLink != null && !submissionLink.trim().isEmpty()) {
            if (!acceptsLink) {
                throw new IllegalArgumentException("Link submissions are not accepted for this deliverable.");
            }
            List<String> allowedLinkPatterns = parseCsv(deliverableConfig.path("allowedLinkPatterns").asText(""));
            if (!allowedLinkPatterns.isEmpty()) {
                String normalizedLink = submissionLink.trim();
                boolean matches = allowedLinkPatterns.stream().anyMatch(pattern -> linkMatchesPattern(normalizedLink, pattern));
                if (!matches) {
                    throw new IllegalArgumentException("Link format is not allowed by teacher. Allowed link formats: " + String.join(", ", allowedLinkPatterns) + ".");
                }
            }
        }
    }

    private boolean isValidSubmissionLink(String link) {
        return parseUriWithOptionalScheme(link) != null;
    }

    private boolean linkMatchesPattern(String submissionLink, String pattern) {
        if (pattern == null || pattern.isBlank()) return false;

        URI submissionUri = parseUriWithOptionalScheme(submissionLink);
        if (submissionUri == null) return false;

        String submissionHost = normalizeHost(submissionUri.getHost());
        if (submissionHost.isBlank()) return false;

        String normalizedPattern = pattern.trim().toLowerCase(Locale.ROOT);
        URI patternUri = parseUriWithOptionalScheme(normalizedPattern);
        if (patternUri == null) {
            return submissionHost.contains(normalizedPattern);
        }

        String patternHost = normalizeHost(patternUri.getHost());
        if (patternHost.isBlank()) return false;

        boolean hostMatches = submissionHost.equals(patternHost) || submissionHost.endsWith("." + patternHost);
        if (!hostMatches) return false;

        String requiredPath = normalizePath(patternUri.getPath());
        if (requiredPath.isEmpty()) return true;

        String submissionPath = normalizePath(submissionUri.getPath());
        return submissionPath.equals(requiredPath) || submissionPath.startsWith(requiredPath + "/");
    }

    private URI parseUriWithOptionalScheme(String value) {
        if (value == null) return null;

        String trimmed = value.trim();
        if (trimmed.isBlank()) return null;

        try {
            URI direct = new URI(trimmed);
            if (direct.getHost() != null) {
                return direct;
            }

            if (direct.getScheme() == null) {
                URI schemeLess = new URI("//" + trimmed);
                if (schemeLess.getHost() != null) {
                    return schemeLess;
                }
            }
        } catch (URISyntaxException ignored) {
            try {
                URI schemeLess = new URI("//" + trimmed);
                if (schemeLess.getHost() != null) {
                    return schemeLess;
                }
            } catch (URISyntaxException ignoredAgain) {
                return null;
            }
        }

        return null;
    }

    private String normalizeHost(String host) {
        return host == null ? "" : host.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank() || "/".equals(path)) return "";
        String normalized = path.trim().toLowerCase(Locale.ROOT);
        return normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
    }

    private List<String> parseCsv(String value) {
        if (value == null || value.isBlank()) return List.of();

        List<String> result = new ArrayList<>();
        for (String token : value.split(",")) {
            String normalized = token == null ? "" : token.trim().toLowerCase();
            if (!normalized.isBlank()) {
                result.add(normalized);
            }
        }
        return result;
    }

    private String extractExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) return "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) return "";
        return fileName.substring(dotIndex + 1).trim();
    }

    private String readableBytes(long bytes) {
        double mb = bytes / (1024.0 * 1024.0);
        if (mb >= 1.0) {
            return String.format("%.1f MB", mb);
        }
        double kb = bytes / 1024.0;
        return String.format("%.1f KB", kb);
    }

    public SubmissionDto.SubmissionResponse reviewSubmission(Long submissionId, SubmissionDto.ReviewSubmissionRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setStatus(request.getStatus());
        submission.setInstructorFeedback(request.getFeedback());
        submission.setReviewedAt(LocalDateTime.now());
        submission.setObtainedMarks(request.getObtainedMarks());
        submission.setMarksLocked(request.getMarksLocked() != null ? request.getMarksLocked() : false);

        if (request.getStatus() == SubmissionStatus.APPROVED) {
            int qualityRating = request.getQualityRating() != null ? Math.max(1, Math.min(5, request.getQualityRating())) : 5;
            double maxMarksVal = submission.getMilestone().getMaxMarks() != null ? submission.getMilestone().getMaxMarks() : 100.0;
            if (maxMarksVal <= 0) maxMarksVal = 100.0;

            double qualityRatio;
            if (request.getObtainedMarks() != null) {
                qualityRatio = request.getObtainedMarks() / maxMarksVal;
                qualityRating = (int) Math.max(1, Math.min(5, Math.round(qualityRatio * 5.0)));
            } else {
                qualityRatio = qualityRating / 5.0;
            }
            submission.setQualityRating(qualityRating);

            double basePoints = submission.getMilestone().getBasePoints();
            Double storedTimeliness = submission.getTimelinessMultiplier();
            double timelinessMultiplier = storedTimeliness != null ? storedTimeliness : 1.0;
            
            // Generalized Formula: Base Points * Timeliness Multiplier * (Obtained / Max)
            double finalPoints = basePoints * timelinessMultiplier * qualityRatio;
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

    public List<SubmissionDto.MilestoneRosterResponse> getMilestoneRoster(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        Subject subject = milestone.getSubject();
        java.util.Set<User> students = subject.getEnrolledStudents();
        List<Submission> submissions = submissionRepository.findByMilestone(milestone);

        return students.stream().map(student -> {
            SubmissionDto.MilestoneRosterResponse r = new SubmissionDto.MilestoneRosterResponse();
            r.setStudentId(student.getId());
            r.setStudentName(student.getFullName());
            r.setStudentEmail(student.getEmail());

            Optional<Submission> subOpt = submissions.stream()
                    .filter(s -> s.getStudent().getId().equals(student.getId()))
                    .findFirst();

            if (subOpt.isPresent()) {
                Submission sub = subOpt.get();
                r.setSubmissionId(sub.getId());
                r.setStatus(sub.getStatus());
                r.setSubmittedAt(sub.getSubmittedAt());
                r.setFileUrl(sub.getFileUrl());
                r.setSubmissionLink(sub.getSubmissionLink());
                r.setComments(sub.getComments());
                r.setQualityRating(sub.getQualityRating());
                r.setFinalPoints(sub.getFinalPoints());
                r.setInstructorFeedback(sub.getInstructorFeedback());
                r.setObtainedMarks(sub.getObtainedMarks());
                r.setMarksLocked(sub.getMarksLocked() != null ? sub.getMarksLocked() : false);

                // Timeliness Label
                if (sub.getTimelinessMultiplier() != null) {
                    if (sub.getTimelinessMultiplier() >= 1.2) {
                        r.setTimelinessLabel("EARLY (1.2x Points)");
                    } else if (sub.getTimelinessMultiplier() >= 1.0) {
                        r.setTimelinessLabel("ON TIME (1.0x Points)");
                    } else {
                        r.setTimelinessLabel("LATE (0.5x Points)");
                    }
                } else {
                    r.setTimelinessLabel("ON TIME");
                }
            } else {
                r.setStatus(LocalDateTime.now().isAfter(milestone.getDeadline()) ? SubmissionStatus.OVERDUE : null);
                r.setTimelinessLabel(LocalDateTime.now().isAfter(milestone.getDeadline()) ? "OVERDUE" : "NOT SUBMITTED");
            }
            return r;
        }).collect(Collectors.toList());
    }

    private SubmissionDto.SubmissionResponse toSubmissionResponse(Submission submission) {
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
        response.setObtainedMarks(submission.getObtainedMarks());
        response.setMarksLocked(submission.getMarksLocked() != null ? submission.getMarksLocked() : false);
        return response;
    }

    public void lockAllSubmissionsForMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        List<Submission> submissions = submissionRepository.findByMilestone(milestone);
        for (Submission sub : submissions) {
            if (sub.getMarksLocked() != Boolean.TRUE) {
                sub.setMarksLocked(true);
                submissionRepository.save(sub);
            }
        }
    }
}
