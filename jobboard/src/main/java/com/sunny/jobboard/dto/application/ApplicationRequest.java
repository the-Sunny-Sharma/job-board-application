package com.sunny.jobboard.dto.application;

import jakarta.validation.constraints.Size;

// Note: resumeUrl is NOT here — it comes from
// the file upload, not the request body.
// coverLetter is optional.
public record ApplicationRequest(

        @Size(max = 2000, message = "Cover letter too long")
        String coverLetter
) {}