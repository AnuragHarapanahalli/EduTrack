package com.edutrack.repository;

import com.edutrack.model.Milestone;
import com.edutrack.model.Submission;
import com.edutrack.model.SubmissionStatus;
import com.edutrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudent(User student);
    List<Submission> findByMilestone(Milestone milestone);
    Optional<Submission> findByMilestoneAndStudent(Milestone milestone, User student);
    void deleteByMilestone(Milestone milestone);
    
    List<Submission> findByMilestoneSubjectId(Long subjectId);

    @Query("SELECT s FROM Submission s WHERE s.milestone.subject.id = :subjectId AND s.student.id = :studentId")
    List<Submission> findBySubjectAndStudent(@Param("subjectId") Long subjectId, @Param("studentId") Long studentId);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.student.id = :studentId AND s.milestone.subject.id = :subjectId AND s.status = :status")
    Long countApprovedByStudentAndSubject(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId, @Param("status") SubmissionStatus status);
}
