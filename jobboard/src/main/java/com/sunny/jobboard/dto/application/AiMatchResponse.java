package com.sunny.jobboard.dto.application;

// Returned when ADMIN triggers AI analysis on an application
public record AiMatchResponse(
        Long applicationId,
        String candidateName,
        String jobTitle,
        Integer matchScore,      // 0-100
        String summary,          // AI explanation
        String skillGaps,        // Skills candidate is missing
        String strengths         // Skills candidate has that match
) {}