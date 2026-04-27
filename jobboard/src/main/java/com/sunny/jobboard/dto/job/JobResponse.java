package com.sunny.jobboard.dto.job;

import com.sunny.jobboard.entity.JobType;
import java.time.LocalDateTime;

// Response DTO — notice we expose postedByName (String)
// NOT the entire User entity. This is intentional.
// Never expose internal entities directly to the client.
public record JobResponse(
        Long id,
        String title,
        String description,
        String company,
        String location,
        JobType jobType,
        Double salaryMin,
        Double salaryMax,
        Boolean isActive,
        String postedByName,   // ← just the name, not the User object
        Long postedById,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}