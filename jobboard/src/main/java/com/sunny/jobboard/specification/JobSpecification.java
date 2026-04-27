package com.sunny.jobboard.specification;

import com.sunny.jobboard.entity.Job;
import com.sunny.jobboard.entity.JobType;
import com.sunny.jobboard.entity.User;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class JobSpecification {

    // 🔖 Private constructor — utility class, never instantiated
    private JobSpecification() {}

    // ── Individual filter methods ──
    // Each returns a Specification<Job> — a single filter condition
    // They get combined in JobService using .and() chains

    public static Specification<Job> hasTitle(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isBlank()) return null;
            // cb.like() → SQL: WHERE LOWER(title) LIKE '%keyword%'
            return cb.like(
                    cb.lower(root.get("title")),
                    "%" + title.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> hasLocation(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isBlank()) return null;
            return cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Job> hasJobType(JobType jobType) {
        return (root, query, cb) -> {
            if (jobType == null) return null;
            // cb.equal() → SQL: WHERE job_type = 'REMOTE'
            return cb.equal(root.get("jobType"), jobType);
        };
    }

    public static Specification<Job> hasSalaryMin(Double salaryMin) {
        return (root, query, cb) -> {
            if (salaryMin == null) return null;
            // cb.greaterThanOrEqualTo() → SQL: WHERE salary_max >= 50000
            return cb.greaterThanOrEqualTo(
                    root.get("salaryMax"), salaryMin
            );
        };
    }

    public static Specification<Job> hasSalaryMax(Double salaryMax) {
        return (root, query, cb) -> {
            if (salaryMax == null) return null;
            // cb.lessThanOrEqualTo() → SQL: WHERE salary_min <= 100000
            return cb.lessThanOrEqualTo(
                    root.get("salaryMin"), salaryMax
            );
        };
    }

    public static Specification<Job> isActive(Boolean active) {
        return (root, query, cb) -> {
            if (active == null) return null;
            return cb.equal(root.get("isActive"), active);
        };
    }

    public static Specification<Job> postedBy(User user) {
        return (root, query, cb) -> {
            if (user == null) return null;
            // root.get("postedBy") navigates the @ManyToOne join
            return cb.equal(root.get("postedBy"), user);
        };
    }

    // ── Combined filter — used by public job listing ──
    // Builds one Specification from all filter params
    // null params are automatically ignored
    public static Specification<Job> withFilters(
            String title,
            String location,
            JobType jobType,
            Double salaryMin,
            Double salaryMax) {

        return Specification
                .where(isActive(true))
                .and(hasTitle(title))
                .and(hasLocation(location))
                .and(hasJobType(jobType))
                .and(hasSalaryMin(salaryMin))
                .and(hasSalaryMax(salaryMax));
    }
}