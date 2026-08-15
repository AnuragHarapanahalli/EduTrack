package com.edutrack.repository;

import com.edutrack.model.Subject;
import com.edutrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByInstructor(User instructor);
    List<Subject> findByEnrolledStudentsContaining(User student);
    Optional<Subject> findByCode(String code);
}
