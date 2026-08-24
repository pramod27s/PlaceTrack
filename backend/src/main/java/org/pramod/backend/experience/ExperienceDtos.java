package org.pramod.backend.experience;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ExperienceDtos {

    private ExperienceDtos() {}

    public record ExperienceRequest(
            @NotBlank(message = "Company name is required")
            @Size(max = 120, message = "Company name cannot exceed 120 characters")
            String companyName,

            @NotBlank(message = "Role is required")
            @Size(max = 120, message = "Role cannot exceed 120 characters")
            String role,

            @Size(max = 80, message = "CTC cannot exceed 80 characters")
            String ctc,

            @Size(max = 120, message = "Location cannot exceed 120 characters")
            String location,

            @NotNull(message = "Drive type is required")
            DriveType driveType,

            @NotNull(message = "Verdict is required")
            Verdict verdict,

            @NotNull(message = "Difficulty rating is required")
            Difficulty difficulty,

            @NotBlank(message = "Experience title is required")
            @Size(max = 200, message = "Title cannot exceed 200 characters")
            String title,

            String summary,
            String roundsDetails,
            String questionsAsked,
            String topics,
            String tips,

            @Size(max = 50, message = "Batch cannot exceed 50 characters")
            String authorBatch,

            boolean anonymous
    ) {}

    public record ExperienceResponse(
            Long id,
            String authorName,
            String authorBatch,
            boolean isAnonymous,
            boolean isAuthor,
            String companyName,
            String role,
            String ctc,
            String location,
            DriveType driveType,
            Verdict verdict,
            Difficulty difficulty,
            String title,
            String summary,
            String roundsDetails,
            String questionsAsked,
            String topics,
            String tips,
            int helpfulCount,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
