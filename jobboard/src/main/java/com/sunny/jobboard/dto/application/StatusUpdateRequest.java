package com.sunny.jobboard.dto.application;

import com.sunny.jobboard.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        ApplicationStatus status
) {}