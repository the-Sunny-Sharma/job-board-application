package com.sunny.jobboard.dto.job;

import com.sunny.jobboard.entity.JobType;

// 🔖 All fields are Optional (nullable)
// This is the object built from query params:
// GET /api/jobs?title=java&location=mumbai&jobType=REMOTE
// Any param not provided = null = filter ignored
public record JobFilterRequest(
        String title,
        String location,
        JobType jobType,
        Double salaryMin,
        Double salaryMax,
        int page,
        int size
) {
    // 🔖 Java Records — Compact Constructor
    // Runs before the default constructor.
    // Used for default values and validation.
    public JobFilterRequest {
        if (page < 0) page = 0;
        if (size <= 0 || size > 50) size = 10;
    }
}