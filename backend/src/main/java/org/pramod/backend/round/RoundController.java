package org.pramod.backend.round;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.round.RoundDtos.RoundRequest;
import org.pramod.backend.round.RoundDtos.RoundResponse;
import org.pramod.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;

    @GetMapping("/companies/{companyId}/rounds")
    public List<RoundResponse> listForCompany(@AuthenticationPrincipal User user,
                                              @PathVariable Long companyId) {
        return roundService.listForCompany(user, companyId);
    }

    @PostMapping("/companies/{companyId}/rounds")
    @ResponseStatus(HttpStatus.CREATED)
    public RoundResponse create(@AuthenticationPrincipal User user,
                                @PathVariable Long companyId,
                                @Valid @RequestBody RoundRequest request) {
        return roundService.create(user, companyId, request);
    }

    /** Every round across all of the user's companies, sorted by date. */
    @GetMapping("/rounds")
    public List<RoundResponse> listAll(@AuthenticationPrincipal User user) {
        return roundService.listForUser(user);
    }

    /** Scheduled rounds within the next 7 days — powers the dashboard. */
    @GetMapping("/rounds/upcoming")
    public List<RoundResponse> listUpcoming(@AuthenticationPrincipal User user) {
        return roundService.listUpcoming(user);
    }

    @PutMapping("/rounds/{id}")
    public RoundResponse update(@AuthenticationPrincipal User user,
                                @PathVariable Long id,
                                @Valid @RequestBody RoundRequest request) {
        return roundService.update(user, id, request);
    }

    @DeleteMapping("/rounds/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        roundService.delete(user, id);
    }
}
