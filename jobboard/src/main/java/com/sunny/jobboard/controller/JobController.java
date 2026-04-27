package com.sunny.jobboard.controller;

import com.sunny.jobboard.dto.ApiResponse;
import com.sunny.jobboard.dto.job.JobFilterRequest;
import com.sunny.jobboard.dto.job.JobRequest;
import com.sunny.jobboard.dto.job.JobResponse;
import com.sunny.jobboard.entity.JobType;
import com.sunny.jobboard.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    // ── Public endpoints ──

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(
            // 🔖 @RequestParam with defaultValue
            // GET /api/jobs?title=java&location=mumbai&page=0&size=10
            // All params are optional — defaults apply if not sent
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) Double salaryMin,
            @RequestParam(required = false) Double salaryMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        JobFilterRequest filter = new JobFilterRequest(
                title, location, jobType,
                salaryMin, salaryMax, page, size);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Jobs fetched successfully",
                        jobService.getAllJobs(filter)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Job fetched successfully",
                        jobService.getJobById(id)));
    }

    // ── Admin endpoints ──

    @GetMapping("/my")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Your jobs fetched successfully",
                        jobService.getMyJobs(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Job created successfully",
                        jobService.createJob(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Job updated successfully",
                        jobService.updateJob(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(
                ApiResponse.success("Job deleted successfully"));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> toggleStatus(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Job status updated",
                        jobService.toggleJobStatus(id)));
    }
}