package com.edutrack.repository;

import com.edutrack.model.Milestone;
import com.edutrack.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findBySubjectOrderByDeadlineAsc(Subject subject);
    List<Milestone> findBySubjectIdOrderByDeadlineAsc(Long subjectId);
    Long countBySubject(Subject subject);
}
