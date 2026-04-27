package com.sunny.jobboard.service;

import com.sunny.jobboard.entity.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    // 🔖 @Async — run email sending in a separate thread
    // Email sending can take 1-3 seconds.
    // Without @Async: the API waits for email to send
    //   before returning response → slow user experience
    // With @Async: API returns immediately, email sends
    //   in background thread → fast user experience
    // Requires @EnableAsync on a @Configuration class

    @Async
    public void sendApplicationConfirmation(
            String candidateEmail,
            String candidateName,
            String jobTitle,
            String company) {

        String subject = "Application Received — " + jobTitle + " at " + company;
        String body = buildApplicationConfirmationEmail(
                candidateName, jobTitle, company);

        sendEmail(candidateEmail, subject, body);
    }

    @Async
    public void sendStatusUpdateNotification(
            String candidateEmail,
            String candidateName,
            String jobTitle,
            String company,
            ApplicationStatus newStatus) {

        String subject = "Application Update — " + jobTitle + " at " + company;
        String body = buildStatusUpdateEmail(
                candidateName, jobTitle, company, newStatus);

        sendEmail(candidateEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // MimeMessageHelper — builds rich HTML emails
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML content
            helper.setFrom("noreply@jobboard.com");

            mailSender.send(message);
            log.info("Email sent to: {}", to);

        } catch (MessagingException e) {
            // Log but don't throw — email failure shouldn't
            // break the main application flow
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildApplicationConfirmationEmail(
            String name, String jobTitle, String company) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">JobBoard</h1>
                </div>
                <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                    <h2>Application Received! 🎉</h2>
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your application for <strong>%s</strong> at <strong>%s</strong>
                       has been successfully submitted.</p>
                    <p>The hiring team will review your application and get back to you.</p>
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0;"><strong>Position:</strong> %s</p>
                        <p style="margin: 8px 0 0;"><strong>Company:</strong> %s</p>
                    </div>
                    <p>Good luck! 🚀</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0;">
                    <p style="color: #888; font-size: 12px;">JobBoard — Find your dream job</p>
                </div>
            </body>
            </html>
            """.formatted(name, jobTitle, company, jobTitle, company);
    }

    private String buildStatusUpdateEmail(
            String name, String jobTitle,
            String company, ApplicationStatus status) {

        String statusMessage = switch (status) {
            case REVIEWING -> "Your application is currently being reviewed by the hiring team.";
            case ACCEPTED  -> "Congratulations! Your application has been accepted. 🎉 The team will contact you shortly.";
            case REJECTED  -> "After careful consideration, we have decided to move forward with other candidates at this time.";
            default        -> "Your application status has been updated.";
        };

        String statusColor = switch (status) {
            case ACCEPTED  -> "#2e7d32";
            case REJECTED  -> "#d32f2f";
            case REVIEWING -> "#1565c0";
            default        -> "#555555";
        };

        return """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">JobBoard</h1>
                </div>
                <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                    <h2>Application Status Update</h2>
                    <p>Hi <strong>%s</strong>,</p>
                    <p>There's an update on your application for
                       <strong>%s</strong> at <strong>%s</strong>.</p>
                    <div style="background: %s; color: white; padding: 16px;
                                border-radius: 8px; margin: 24px 0; text-align: center;">
                        <strong style="font-size: 18px;">%s</strong>
                    </div>
                    <p>%s</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0;">
                    <p style="color: #888; font-size: 12px;">JobBoard — Find your dream job</p>
                </div>
            </body>
            </html>
            """.formatted(name, jobTitle, company,
                statusColor, status.name(), statusMessage);
    }
}