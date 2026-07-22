package com.edutrack.controller;

import com.edutrack.dto.MilestoneDto;
import com.edutrack.service.MilestoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
@CrossOrigin(origins = "*")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping
    public ResponseEntity<MilestoneDto.MilestoneResponse> createMilestone(@RequestBody MilestoneDto.CreateMilestoneRequest request) {
        return ResponseEntity.ok(milestoneService.createMilestone(request));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<MilestoneDto.MilestoneResponse>> getMilestonesBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(milestoneService.getMilestonesBySubject(subjectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MilestoneDto.MilestoneResponse> getMilestoneById(@PathVariable Long id) {
        return ResponseEntity.ok(milestoneService.getMilestoneById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}
