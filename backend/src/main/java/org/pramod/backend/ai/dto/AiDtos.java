package org.pramod.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import org.pramod.backend.round.RoundMode;
import org.pramod.backend.round.RoundType;

public final class AiDtos {

    private AiDtos() {
    }

    public record ParseNoticeRequest(
            @NotBlank(message = "Notice text cannot be blank") String rawText) {
    }

    public record ParsedCompanyResponse(
            String name,
            String role,
            String ctc,
            String location,
            String jdLink,
            Boolean registeredOnSuperset,
            String researchNotes,
            String resumeVersion) {
    }

    public record ParsedRoundResponse(
            RoundType type,
            String title,
            String scheduledAt,
            Integer durationMinutes,
            RoundMode mode,
            String meetingLink,
            String location) {
    }
}
