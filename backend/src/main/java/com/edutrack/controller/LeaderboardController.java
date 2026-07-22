package com.edutrack.controller;

import com.edutrack.dto.LeaderboardDto;
import com.edutrack.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<LeaderboardDto.LeaderboardEntryResponse>> getLeaderboardBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboardBySubject(subjectId));
    }
}
