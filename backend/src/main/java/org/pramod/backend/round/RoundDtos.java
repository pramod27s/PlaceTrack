package org.pramod.backend.round;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/** Wire-format records for round endpoints. */
public final class RoundDtos {

    private RoundDtos() {
    }

    public record RoundRequest(
            @NotNull RoundType type,
            @Size(max = 120) String title,
            @NotNull LocalDateTime scheduledAt,
            @Min(5) @Max(600) Integer durationMinutes,
            RoundMode mode,
            @Size(max = 1000) String meetingLink,
            @Size(max = 200) String location,
            RoundStatus status) {
    }

    /** A pointer to another round that overlaps in time with this one. */
    public record ConflictDto(
            Long roundId,
            String companyName,
            RoundType type,
            LocalDateTime scheduledAt) {
    }

    public record RoundResponse(
            Long id,
            Long companyId,
            String companyName,
            RoundType type,
            String title,
            LocalDateTime scheduledAt,
            Integer durationMinutes,
            RoundMode mode,
            String meetingLink,
            String location,
            RoundStatus status,
            boolean hasJournal,
            List<ConflictDto> conflicts,
            Instant createdAt) {
    }
}
