package com.sunny.jobboard.repository;

import com.sunny.jobboard.entity.Application;
import com.sunny.jobboard.entity.ApplicationStatus;
import com.sunny.jobboard.entity.Job;
import com.sunny.jobboard.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Candidate views their own applications
    Page<Application> findByCandidate(User candidate, Pageable pageable);

    // Admin views all applicants for a specific job
    Page<Application> findByJob(Job job, Pageable pageable);

    // Admin views applicants filtered by status
    Page<Application> findByJobAndStatus(
            Job job, ApplicationStatus status, Pageable pageable);

    // Check if candidate already applied to this job
    // Used to prevent duplicate applications
    boolean existsByJobAndCandidate(Job job, User candidate);

    // Find specific application (used for status update)
    Optional<Application> findByIdAndJob(Long id, Job job);

    // Count applications per job (for admin dashboard stats)
    long countByJob(Job job);

    // Count by status (for admin dashboard stats)
    long countByJobAndStatus(Job job, ApplicationStatus status);
}