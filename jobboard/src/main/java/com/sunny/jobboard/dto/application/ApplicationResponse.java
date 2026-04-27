package com.sunny.jobboard.dto.application;

import com.sunny.jobboard.entity.ApplicationStatus;
import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,

        // Job info — just what the client needs
        Long jobId,
        String jobTitle,
        String company,

        // Candidate info
        Long candidateId,
        String candidateName,
        String candidateEmail,

        // Application details
        String resumeUrl,
        String coverLetter,
        ApplicationStatus status,

        // AI fields — null until analysis is triggered
        Integer aiMatchScore,
        String aiMatchSummary,

        LocalDateTime appliedAt,
        LocalDateTime updatedAt
) {}