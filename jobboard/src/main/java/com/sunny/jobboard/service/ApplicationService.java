package com.sunny.jobboard.service;

import com.sunny.jobboard.dto.application.*;
import com.sunny.jobboard.entity.*;
import com.sunny.jobboard.exception.BadRequestException;
import com.sunny.jobboard.exception.ResourceNotFoundException;
import com.sunny.jobboard.exception.UnauthorizedException;
import com.sunny.jobboard.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobService jobService;
    private final FileUploadService fileUploadService;
    private final EmailService emailService;
    private final ChatModel chatModel;

    // ── Helper ──
    private User getCurrentUser() {
        return (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private Pageable buildPageable(int page, int size) {
        return PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "appliedAt"));
    }

    private ApplicationResponse toResponse(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getCompany(),
                app.getCandidate().getId(),
                app.getCandidate().getName(),
                app.getCandidate().getEmail(),
                app.getResumeUrl(),
                app.getCoverLetter(),
                app.getStatus(),
                app.getAiMatchScore(),
                app.getAiMatchSummary(),
                app.getAppliedAt(),
                app.getUpdatedAt()
        );
    }

    // ── Candidate applies to a job ──
    @Transactional
    public ApplicationResponse applyToJob(
            Long jobId,
            ApplicationRequest request,
            MultipartFile resumeFile) {

        User candidate = getCurrentUser();
        Job job = jobService.findJobEntityById(jobId);

        // Guard: job must be active
        if (!job.getIsActive()) {
            throw new BadRequestException(
                    "This job posting is no longer active");
        }

        // Guard: prevent duplicate applications
        if (applicationRepository.existsByJobAndCandidate(job, candidate)) {
            throw new BadRequestException(
                    "You have already applied to this job");
        }

        // Upload resume to Cloudinary
        String resumeUrl = fileUploadService.uploadResume(resumeFile);

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resumeUrl(resumeUrl)
                .coverLetter(request.coverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        Application saved = applicationRepository.save(application);

        // Send confirmation email asynchronously
        emailService.sendApplicationConfirmation(
                candidate.getEmail(),
                candidate.getName(),
                job.getTitle(),
                job.getCompany()
        );

        log.info("Application submitted — job: {}, candidate: {}",
                jobId, candidate.getEmail());

        return toResponse(saved);
    }

    // ── Candidate views their applications ──
    public Page<ApplicationResponse> getMyApplications(int page, int size) {
        User candidate = getCurrentUser();
        return applicationRepository
                .findByCandidate(candidate, buildPageable(page, size))
                .map(this::toResponse);
    }

    // ── Admin views applicants for a job ──
    public Page<ApplicationResponse> getApplicationsForJob(
            Long jobId, int page, int size) {
        Job job = jobService.findJobEntityById(jobId);
        return applicationRepository
                .findByJob(job, buildPageable(page, size))
                .map(this::toResponse);
    }

    // ── Admin updates application status ──
    @Transactional
    public ApplicationResponse updateStatus(
            Long applicationId,
            StatusUpdateRequest request) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id: " + applicationId));

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(request.status());
        Application updated = applicationRepository.save(application);

        // Only send email if status actually changed
        if (oldStatus != request.status()) {
            emailService.sendStatusUpdateNotification(
                    application.getCandidate().getEmail(),
                    application.getCandidate().getName(),
                    application.getJob().getTitle(),
                    application.getJob().getCompany(),
                    request.status()
            );
        }

        return toResponse(updated);
    }

    // ── Admin triggers AI resume analysis ──
    @Transactional
    public AiMatchResponse analyseResumeMatch(Long applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found with id: " + applicationId));

        Job job = application.getJob();
        User candidate = application.getCandidate();

        // 🔖 Spring AI — ChatClient
        // Build a prompt combining job description + resume URL
        // We send the job details and ask AI to evaluate the match
        String prompt = buildAiPrompt(job, application);

        String aiResponse = ChatClient.create(chatModel)
                .prompt()
                .user(prompt)
                .call()
                .content();

        // Parse AI response into structured fields
        AiAnalysisResult result = parseAiResponse(aiResponse);

        // Persist AI results on the application
        application.setAiMatchScore(result.score());
        application.setAiMatchSummary(result.summary());
        applicationRepository.save(application);

        log.info("AI analysis complete — applicationId: {}, score: {}",
                applicationId, result.score());

        return new AiMatchResponse(
                applicationId,
                candidate.getName(),
                job.getTitle(),
                result.score(),
                result.summary(),
                result.skillGaps(),
                result.strengths()
        );
    }

    // ── AI Prompt Builder ──
    private String buildAiPrompt(Job job, Application application) {
        return """
            You are an expert technical recruiter. Analyse this job application.

            JOB DETAILS:
            Title: %s
            Company: %s
            Description: %s
            Location: %s
            Job Type: %s

            CANDIDATE:
            Name: %s
            Cover Letter: %s

            Based on the job description and cover letter, provide your analysis
            in EXACTLY this format (no extra text):

            SCORE: [0-100]
            SUMMARY: [2-3 sentence overall assessment]
            STRENGTHS: [comma-separated list of matching skills/qualities]
            SKILL_GAPS: [comma-separated list of missing skills or areas to improve]
            """.formatted(
                job.getTitle(),
                job.getCompany(),
                job.getDescription(),
                job.getLocation(),
                job.getJobType(),
                application.getCandidate().getName(),
                application.getCoverLetter() != null
                        ? application.getCoverLetter()
                        : "No cover letter provided"
        );
    }

    // ── Parse AI text response into structured record ──
    private AiAnalysisResult parseAiResponse(String response) {
        try {
            int score = 50; // default
            String summary = "";
            String strengths = "";
            String skillGaps = "";

            for (String line : response.split("\n")) {
                if (line.startsWith("SCORE:")) {
                    String scoreStr = line.replace("SCORE:", "").trim();
                    score = Integer.parseInt(scoreStr.replaceAll("[^0-9]", ""));
                } else if (line.startsWith("SUMMARY:")) {
                    summary = line.replace("SUMMARY:", "").trim();
                } else if (line.startsWith("STRENGTHS:")) {
                    strengths = line.replace("STRENGTHS:", "").trim();
                } else if (line.startsWith("SKILL_GAPS:")) {
                    skillGaps = line.replace("SKILL_GAPS:", "").trim();
                }
            }

            // Clamp score between 0-100
            score = Math.max(0, Math.min(100, score));
            return new AiAnalysisResult(score, summary, strengths, skillGaps);

        } catch (Exception e) {
            log.warn("Failed to parse AI response, using defaults: {}",
                    e.getMessage());
            return new AiAnalysisResult(50,
                    "Analysis completed.", "", "");
        }
    }

    // Internal record for parsed AI response
    private record AiAnalysisResult(
            int score,
            String summary,
            String strengths,
            String skillGaps) {}
}