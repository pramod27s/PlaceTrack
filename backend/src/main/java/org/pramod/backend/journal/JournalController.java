package org.pramod.backend.journal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.journal.JournalDtos.JournalRequest;
import org.pramod.backend.journal.JournalDtos.JournalResponse;
import org.pramod.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    /** The full personal interview-prep dataset, newest first. */
    @GetMapping("/journal")
    public List<JournalResponse> listAll(@AuthenticationPrincipal User user) {
        return journalService.listForUser(user);
    }

    /** All journal entries attached to a given round, oldest first. */
    @GetMapping("/rounds/{roundId}/journal")
    public List<JournalResponse> listForRound(@AuthenticationPrincipal User user,
                                              @PathVariable Long roundId) {
        return journalService.listForRound(user, roundId);
    }

    /** Creates a new journal entry attached to a round. */
    @PostMapping("/rounds/{roundId}/journal")
    @ResponseStatus(HttpStatus.CREATED)
    public JournalResponse create(@AuthenticationPrincipal User user,
                                  @PathVariable Long roundId,
                                  @Valid @RequestBody JournalRequest request) {
        return journalService.create(user, roundId, request);
    }

    /** Updates an existing journal entry by its own id. */
    @PutMapping("/journal/{entryId}")
    public JournalResponse update(@AuthenticationPrincipal User user,
                                  @PathVariable Long entryId,
                                  @Valid @RequestBody JournalRequest request) {
        return journalService.update(user, entryId, request);
    }

    @DeleteMapping("/journal/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long entryId) {
        journalService.delete(user, entryId);
    }
}
