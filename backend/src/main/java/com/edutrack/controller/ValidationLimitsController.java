package com.edutrack.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edutrack.config.ValidationConfig;

@RestController
@RequestMapping("/api/validation-limits")
public class ValidationLimitsController {

    private final ValidationConfig validationConfig;

    public ValidationLimitsController(ValidationConfig validationConfig) {
        this.validationConfig = validationConfig;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLimits() {
        Map<String, Object> limits = new HashMap<>();
        limits.put("subjectNameMin", validationConfig.getSubjectNameMin());
        limits.put("subjectNameMax", validationConfig.getSubjectNameMax());
        limits.put("subjectCodeMin", validationConfig.getSubjectCodeMin());
        limits.put("subjectCodeMax", validationConfig.getSubjectCodeMax());
        limits.put("subjectDescriptionMax", validationConfig.getSubjectDescriptionMax());

        limits.put("milestoneTitleMin", validationConfig.getMilestoneTitleMin());
        limits.put("milestoneTitleMax", validationConfig.getMilestoneTitleMax());
        limits.put("milestoneDescriptionMin", validationConfig.getMilestoneDescriptionMin());
        limits.put("milestoneDescriptionMax", validationConfig.getMilestoneDescriptionMax());
        limits.put("milestonePointsMin", validationConfig.getMilestonePointsMin());
        limits.put("milestonePointsMax", validationConfig.getMilestonePointsMax());

        limits.put("userFullnameMin", validationConfig.getUserFullnameMin());
        limits.put("userFullnameMax", validationConfig.getUserFullnameMax());
        limits.put("userEmailMax", validationConfig.getUserEmailMax());
        limits.put("userPasswordMin", validationConfig.getUserPasswordMin());
        limits.put("userPasswordMax", validationConfig.getUserPasswordMax());

        limits.put("submissionCommentsMax", validationConfig.getSubmissionCommentsMax());
        limits.put("submissionLinkMax", validationConfig.getSubmissionLinkMax());
        limits.put("submissionFileMaxBytes", validationConfig.getSubmissionFileMaxBytes());

        return ResponseEntity.ok(limits);
    }
}
