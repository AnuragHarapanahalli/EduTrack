package com.edutrack.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.edutrack.dto.SubmissionDto;
import com.edutrack.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionDto.SubmissionResponse> submitDeliverable(
            @RequestParam("milestoneId") Long milestoneId,
            @RequestParam("studentId") Long studentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "submissionLink", required = false) String submissionLink,
            @RequestParam(value = "deliverableIndex", required = false) Integer deliverableIndex,
            @RequestParam(value = "comments", required = false) String comments
    ) {
        return ResponseEntity.ok(submissionService.submitDeliverable(milestoneId, studentId, file, submissionLink, deliverableIndex, comments));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<SubmissionDto.SubmissionResponse> reviewSubmission(
            @PathVariable Long id,
            @RequestBody SubmissionDto.ReviewSubmissionRequest request
    ) {
        return ResponseEntity.ok(submissionService.reviewSubmission(id, request));
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<List<SubmissionDto.SubmissionResponse>> getSubmissionsByMilestone(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByMilestone(milestoneId));
    }

    @GetMapping("/milestone/{milestoneId}/roster")
    public ResponseEntity<List<SubmissionDto.MilestoneRosterResponse>> getMilestoneRoster(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(submissionService.getMilestoneRoster(milestoneId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDto.SubmissionResponse>> getSubmissionsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentId));
    }

    @GetMapping("/milestone/{milestoneId}/student/{studentId}")
    public ResponseEntity<SubmissionDto.SubmissionResponse> getSubmissionForMilestoneAndStudent(
            @PathVariable Long milestoneId,
            @PathVariable Long studentId
    ) {
        SubmissionDto.SubmissionResponse sub = submissionService.getSubmissionForMilestoneAndStudent(milestoneId, studentId);
        if (sub == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(sub);
    }

    @PostMapping("/milestone/{milestoneId}/lock-all")
    public ResponseEntity<Void> lockAllSubmissionsForMilestone(@PathVariable Long milestoneId) {
        submissionService.lockAllSubmissionsForMilestone(milestoneId);
        return ResponseEntity.ok().build();
    }
}
