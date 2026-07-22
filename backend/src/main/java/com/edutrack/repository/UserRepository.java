package com.edutrack.repository;

import com.edutrack.model.Batch;
import com.edutrack.model.Role;
import com.edutrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByBatch(Batch batch);
    List<User> findByBatchIdAndRole(Long batchId, Role role);
}
