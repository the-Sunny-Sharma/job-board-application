package com.sunny.jobboard.dto.job;

import com.sunny.jobboard.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record JobRequest(

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Company is required")
        String company,

        @NotBlank(message = "Location is required")
        String location,

        @NotNull(message = "Job type is required")
        JobType jobType,

        @Positive(message = "Minimum salary must be positive")
        Double salaryMin,

        @Positive(message = "Maximum salary must be positive")
        Double salaryMax
) {}