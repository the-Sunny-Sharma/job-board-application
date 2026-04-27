package com.sunny.jobboard.service;

import com.sunny.jobboard.dto.job.JobFilterRequest;
import com.sunny.jobboard.dto.job.JobRequest;
import com.sunny.jobboard.dto.job.JobResponse;
import com.sunny.jobboard.entity.Job;
import com.sunny.jobboard.entity.User;
import com.sunny.jobboard.exception.ResourceNotFoundException;
import com.sunny.jobboard.mapper.JobMapper;
import com.sunny.jobboard.repository.JobRepository;
import com.sunny.jobboard.specification.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobMapper jobMapper;

    // ── Helper ──
    private User getCurrentUser() {
        return (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private Pageable buildPageable(int page, int size) {
        return PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // ── Public endpoints ──

    public Page<JobResponse> getAllJobs(JobFilterRequest filter) {
        Pageable pageable = buildPageable(filter.page(), filter.size());

        // 🔖 Specification.where() builds the dynamic query
        // null filters are automatically ignored
        Specification<Job> spec = JobSpecification.withFilters(
                filter.title(),
                filter.location(),
                filter.jobType(),
                filter.salaryMin(),
                filter.salaryMax()
        );

        return jobRepository.findAll(spec, pageable)
                .map(jobMapper::toResponse);
        // 🔖 .map() on Page<T> transforms each element
        // jobMapper::toResponse is a method reference
        // equivalent to job -> jobMapper.toResponse(job)
    }

    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id: " + id));
        return jobMapper.toResponse(job);
    }

    // ── Admin endpoints ──

    public Page<JobResponse> getMyJobs(int page, int size) {
        User currentUser = getCurrentUser();
        return jobRepository
                .findByPostedByAndIsActive(
                        currentUser, true, buildPageable(page, size))
                .map(jobMapper::toResponse);
    }

    @Transactional
    public JobResponse createJob(JobRequest request) {
        User currentUser = getCurrentUser();

        Job job = Job.builder()
                .title(request.title())
                .description(request.description())
                .company(request.company())
                .location(request.location())
                .jobType(request.jobType())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .postedBy(currentUser)
                .build();

        return jobMapper.toResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse updateJob(Long id, JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id: " + id));

        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setCompany(request.company());
        job.setLocation(request.location());
        job.setJobType(request.jobType());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());

        return jobMapper.toResponse(jobRepository.save(job));
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id: " + id));
        // Soft delete — mark inactive instead of deleting row
        job.setIsActive(false);
        jobRepository.save(job);
    }

    @Transactional
    public JobResponse toggleJobStatus(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id: " + id));
        job.setIsActive(!job.getIsActive());
        return jobMapper.toResponse(jobRepository.save(job));
    }

    // Helper used by ApplicationService
    public Job findJobEntityById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found with id: " + id));
    }
}