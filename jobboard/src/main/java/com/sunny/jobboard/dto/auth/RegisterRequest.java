package com.sunny.jobboard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Java Concept — Records (Java 16+)
// A record is an immutable data carrier.
// Automatically generates:
//   → constructor with all fields
//   → getters (title(), not getTitle())
//   → equals(), hashCode(), toString()
// Perfect for DTOs — they only carry data, never change.
// Replaces @Data class + @AllArgsConstructor + final fields.

public record RegisterRequest(

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password
) {}