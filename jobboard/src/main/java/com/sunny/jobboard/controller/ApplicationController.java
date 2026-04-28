package com.sunny.jobboard.controller;

import com.sunny.jobboard.dto.ApiResponse;
import com.sunny.jobboard.dto.application.AiMatchResponse;
import com.sunny.jobboard.dto.application.ApplicationRequest;
import com.sunny.jobboard.dto.application.ApplicationResponse;
import com.sunny.jobboard.dto.application.StatusUpdateRequest;
import com.sunny.jobboard.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    // ── Candidate applies to a job ──
    // 🔖 @RequestPart — handles multipart request
    // This endpoint receives BOTH a file AND JSON in one request
    // "resume" → the PDF file part
    // "data"   → the ApplicationRequest JSON part

//    @PostMapping(value = "/{jobId}/apply",
//            consumes = "multipart/form-data")
//    @PreAuthorize("hasRole('ROLE_USER')")
//    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToJob(
//            @PathVariable Long jobId,
//            @RequestPart("data") @Valid ApplicationRequest request,
//            @RequestPart("resume") MultipartFile resumeFile) {
//
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(ApiResponse.success(
//                        "Application submitted successfully",
//                        applicationService.applyToJob(
//                                jobId, request, resumeFile)));
//    }

    // Temporary alternative for testing
    @PostMapping(value = "/{jobId}/apply",
            consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String coverLetter,
            @RequestPart("resume") MultipartFile resumeFile) {

        ApplicationRequest request = new ApplicationRequest(coverLetter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Application submitted successfully",
                        applicationService.applyToJob(
                                jobId, request, resumeFile)));
    }

    // ── Candidate views their own applications ──
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Applications fetched successfully",
                        applicationService.getMyApplications(page, size)));
    }

    // ── Admin views all applicants for a specific job ──
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Applications fetched successfully",
                        applicationService.getApplicationsForJob(
                                jobId, page, size)));
    }

    // ── Admin updates application status ──
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Application status updated",
                        applicationService.updateStatus(id, request)));
    }

    // ── Admin triggers AI analysis on an application ──
    @PostMapping("/{id}/analyse")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AiMatchResponse>> analyseResume(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "AI analysis completed",
                        applicationService.analyseResumeMatch(id)));
    }
}