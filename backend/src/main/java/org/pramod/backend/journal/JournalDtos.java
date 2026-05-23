package org.pramod.backend.journal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.pramod.backend.round.RoundType;

import java.time.Instant;
import java.time.LocalDateTime;

/** Wire-format records for journal endpoints. */
public final class JournalDtos {

    private JournalDtos() {
    }

    public record JournalRequest(
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
            String questionsAsked,
            String topics,
            String whatWentWell,
            String whatFlopped,
            String resources,
            Integer rating,
            Instant updatedAt) {
    }
}
