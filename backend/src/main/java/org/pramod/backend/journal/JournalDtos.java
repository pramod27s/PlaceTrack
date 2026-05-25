package org.pramod.backend.journal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.pramod.backend.round.RoundType;

import java.time.Instant;
import java.time.LocalDateTime;

/** Wire-format records for journal endpoints. */
public final class JournalDtos {

    private JournalDtos() {
    }

    public record JournalRequest(
            @Size(max = 120) String title,
            String questionsAsked,
            String topics,
            String whatWentWell,
            String whatFlopped,
            String resources,
            @Min(1) @Max(5) Integer rating) {
    }

    public record JournalResponse(
            Long id,
            Long roundId,
            Long companyId,
            String companyName,
            RoundType roundType,
            LocalDateTime roundScheduledAt,
            String title,
            String questionsAsked,
            String topics,
            String whatWentWell,
            String whatFlopped,
            String resources,
            Integer rating,
            Instant createdAt,
            Instant updatedAt) {
    }
}
