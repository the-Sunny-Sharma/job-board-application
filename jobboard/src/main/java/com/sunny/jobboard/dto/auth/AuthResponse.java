package com.sunny.jobboard.dto.auth;

public record AuthResponse(
        String token,
        String name,
        String email,
        String role
) {}