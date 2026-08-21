package com.edutrack.service;

import com.edutrack.dto.LeaderboardDto;
import com.edutrack.model.*;
import com.edutrack.repository.MilestoneRepository;
import com.edutrack.repository.SubjectRepository;
import com.edutrack.repository.SubmissionRepository;
import com.edutrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final MilestoneRepository milestoneRepository;

    public LeaderboardService(
            SubjectRepository subjectRepository,
            UserRepository userRepository,
            SubmissionRepository submissionRepository,
            MilestoneRepository milestoneRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.milestoneRepository = milestoneRepository;
    }

    public List<LeaderboardDto.LeaderboardEntryResponse> getLeaderboardBySubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Set<User> students = subject.getEnrolledStudents();
        Long totalMilestonesCount = milestoneRepository.countBySubject(subject);
        int totalMilestones = totalMilestonesCount != null ? totalMilestonesCount.intValue() : 0;

        List<LeaderboardDto.LeaderboardEntryResponse> entries = new ArrayList<>();

        for (User student : students) {
            List<Submission> studentSubmissions = submissionRepository.findBySubjectAndStudent(subjectId, student.getId());
            
            double totalPoints = studentSubmissions.stream()
                    .filter(s -> s.getStatus() == SubmissionStatus.APPROVED && s.getMarksLocked() != Boolean.FALSE)
                    .mapToDouble(s -> s.getFinalPoints() != null ? s.getFinalPoints() : 0.0)
                    .sum();

            long approvedCount = studentSubmissions.stream()
                    .filter(s -> s.getStatus() == SubmissionStatus.APPROVED && s.getMarksLocked() != Boolean.FALSE)
                    .count();

            double completionPercentage = totalMilestones > 0 ? ((double) approvedCount / totalMilestones) * 100.0 : 0.0;
            completionPercentage = Math.round(completionPercentage * 10.0) / 10.0;
            totalPoints = Math.round(totalPoints * 100.0) / 100.0;

            entries.add(new LeaderboardDto.LeaderboardEntryResponse(
                    0, // Rank set after sorting
                    student.getId(),
                    student.getFullName(),
                    student.getEmail(),
                    totalPoints,
                    (int) approvedCount,
                    totalMilestones,
                    completionPercentage
            ));
        }

        // Sort descending by total points, then by completion percentage
        entries.sort((a, b) -> {
            int cmp = Double.compare(b.getTotalPoints(), a.getTotalPoints());
            if (cmp != 0) return cmp;
            return Double.compare(b.getCompletionPercentage(), a.getCompletionPercentage());
        });

        // Assign ranks (handling ties)
        int rank = 1;
        for (int i = 0; i < entries.size(); i++) {
            if (i > 0 && Objects.equals(entries.get(i).getTotalPoints(), entries.get(i - 1).getTotalPoints())) {
                entries.get(i).setRank(entries.get(i - 1).getRank());
            } else {
                entries.get(i).setRank(i + 1);
            }
        }

        return entries;
    }
}
