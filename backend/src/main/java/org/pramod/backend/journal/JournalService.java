package org.pramod.backend.journal;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.exception.ResourceNotFoundException;
import org.pramod.backend.journal.JournalDtos.JournalRequest;
import org.pramod.backend.journal.JournalDtos.JournalResponse;
import org.pramod.backend.round.Round;
import org.pramod.backend.round.RoundService;
import org.pramod.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final RoundService roundService;

    @Transactional(readOnly = true)
    public List<JournalResponse> listForUser(User user) {
        return journalRepository.findByRound_Company_UserOrderByUpdatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Returns the journal entry for a round, or null if none has been written yet. */
    @Transactional(readOnly = true)
    public JournalResponse getForRound(User user, Long roundId) {
        Round round = roundService.require(user, roundId);
        return journalRepository.findByRound(round)
                .map(this::toResponse)
                .orElse(null);
    }

    /** Creates or updates the journal entry attached to a round. */
    @Transactional
    public JournalResponse upsert(User user, Long roundId, JournalRequest request) {
        Round round = roundService.require(user, roundId);
        JournalEntry entry = journalRepository.findByRound(round)
                .orElseGet(() -> JournalEntry.builder().round(round).build());
        entry.setQuestionsAsked(request.questionsAsked());
        entry.setTopics(request.topics());
        entry.setWhatWentWell(request.whatWentWell());
        entry.setWhatFlopped(request.whatFlopped());
        entry.setResources(request.resources());
        entry.setRating(request.rating());
        return toResponse(journalRepository.save(entry));
    }

    @Transactional
    public void delete(User user, Long roundId) {
        Round round = roundService.require(user, roundId);
        JournalEntry entry = journalRepository.findByRound(round)
                .orElseThrow(() -> new ResourceNotFoundException("No journal entry for this round."));
        journalRepository.delete(entry);
    }

    private JournalResponse toResponse(JournalEntry e) {
        Round round = e.getRound();
        return new JournalResponse(
                e.getId(),
                round.getId(),
                round.getCompany().getId(),
                round.getCompany().getName(),
                round.getType(),
                round.getScheduledAt(),
                e.getQuestionsAsked(),
                e.getTopics(),
                e.getWhatWentWell(),
                e.getWhatFlopped(),
                e.getResources(),
                e.getRating(),
                e.getUpdatedAt());
    }
}
