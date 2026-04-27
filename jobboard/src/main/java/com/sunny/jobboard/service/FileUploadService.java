package com.sunny.jobboard.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sunny.jobboard.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final Cloudinary cloudinary;

    // Allowed file types
    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public String uploadResume(MultipartFile file) {

        // 🔖 Validate before uploading — fail fast principle
        validateFile(file);

        try {
            // Generate unique filename to avoid collisions
            String fileName = "resume_" + UUID.randomUUID();

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id",    fileName,
                            "folder",       "jobboard/resumes",
                            "resource_type","raw",    // raw = non-image files (PDF)
                            "format",       "pdf"
                    )
            );

            String url = (String) uploadResult.get("secure_url");
            log.info("Resume uploaded successfully: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload resume: {}", e.getMessage());
            throw new BadRequestException("Failed to upload resume. Please try again.");
        }
    }

    public void deleteResume(String resumeUrl) {
        try {
            // Extract public_id from Cloudinary URL
            String publicId = extractPublicId(resumeUrl);
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", "raw"));
            log.info("Resume deleted: {}", publicId);
        } catch (IOException e) {
            // Log but don't throw — deletion failure is non-critical
            log.warn("Failed to delete resume from Cloudinary: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }
        if (!PDF_CONTENT_TYPE.equals(file.getContentType())) {
            throw new BadRequestException("Only PDF files are accepted");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size must not exceed 5MB");
        }
    }

    private String extractPublicId(String url) {
        // Cloudinary URL format:
        // https://res.cloudinary.com/cloud/raw/upload/v123/jobboard/resumes/resume_uuid.pdf
        // We need: jobboard/resumes/resume_uuid
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return url;
        String afterUpload = parts[1];
        // Remove version prefix (v1234567/)
        afterUpload = afterUpload.replaceFirst("v\\d+/", "");
        // Remove file extension
        return afterUpload.replaceFirst("\\.[^.]+$", "");
    }
}