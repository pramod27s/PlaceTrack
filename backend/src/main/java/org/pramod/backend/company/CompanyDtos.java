package org.pramod.backend.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

/** Wire-format records for company endpoints. */
public final class CompanyDtos {

    private CompanyDtos() {
    }

    public record CompanyRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 120) String role,
            @Size(max = 120) String ctc,
            @Size(max = 120) String location,
            @Size(max = 1000) String jdLink,
            Stage stage,
            LocalDate appliedOn,
            Boolean registeredOnSuperset,
            String researchNotes,
            @Size(max = 120) String resumeVersion) {
    }

    public record StageUpdateRequest(@NotNull Stage stage) {
    }

    public record CompanyResponse(
            Long id,
            String name,
            String role,
            String ctc,
            String location,
            String jdLink,
            Stage stage,
            LocalDate appliedOn,
            boolean registeredOnSuperset,
            String researchNotes,
            String resumeVersion,
            int roundCount,
            Instant createdAt,
            Instant updatedAt) {
    }
}
