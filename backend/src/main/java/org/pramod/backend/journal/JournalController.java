package org.pramod.backend.journal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.journal.JournalDtos.JournalRequest;
import org.pramod.backend.journal.JournalDtos.JournalResponse;
import org.pramod.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    /** The journal entry for a round; {@code 204 No Content} if not written yet. */
    @GetMapping("/rounds/{roundId}/journal")
    public ResponseEntity<JournalResponse> getForRound(@AuthenticationPrincipal User user,
                                                       @PathVariable Long roundId) {
        JournalResponse entry = journalService.getForRound(user, roundId);
        return entry == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(entry);
    }

    @PutMapping("/rounds/{roundId}/journal")
    public JournalResponse upsert(@AuthenticationPrincipal User user,
                                  @PathVariable Long roundId,
                                  @Valid @RequestBody JournalRequest request) {
        return journalService.upsert(user, roundId, request);
    }

    @DeleteMapping("/rounds/{roundId}/journal")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long roundId) {
        journalService.delete(user, roundId);
    }
}
