package org.pramod.backend.experience;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.experience.ExperienceDtos.ExperienceRequest;
import org.pramod.backend.experience.ExperienceDtos.ExperienceResponse;
import org.pramod.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @GetMapping
    public List<ExperienceResponse> list(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) DriveType driveType,
            @RequestParam(required = false) Verdict verdict,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false, defaultValue = "latest") String sortBy
    ) {
        return experienceService.search(user, query, company, driveType, verdict, difficulty, sortBy);
    }

    @GetMapping("/{id}")
    public ExperienceResponse get(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return experienceService.get(user, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceResponse create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExperienceRequest request
    ) {
        return experienceService.create(user, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        experienceService.delete(user, id);
    }

    @PostMapping("/{id}/helpful")
    public ExperienceResponse incrementHelpful(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return experienceService.incrementHelpful(user, id);
    }
}
