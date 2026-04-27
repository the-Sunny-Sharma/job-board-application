package com.sunny.jobboard.repository;

import com.sunny.jobboard.entity.Job;
import com.sunny.jobboard.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends
        JpaRepository<Job, Long>,
        JpaSpecificationExecutor<Job> {

    // Find all active jobs posted by a specific admin
    Page<Job> findByPostedByAndIsActive(
            User postedBy, Boolean isActive, Pageable pageable);

    // Find all active jobs (public listing)
    Page<Job> findByIsActive(Boolean isActive, Pageable pageable);
}