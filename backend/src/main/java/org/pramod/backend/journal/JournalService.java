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

    /** All journal entries attached to a given round, oldest first. */
    @Transactional(readOnly = true)
    public List<JournalResponse> listForRound(User user, Long roundId) {
        Round round = roundService.require(user, roundId);
        return journalRepository.findByRoundOrderByCreatedAtAsc(round).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public JournalResponse create(User user, Long roundId, JournalRequest request) {
        Round round = roundService.require(user, roundId);
        JournalEntry entry = JournalEntry.builder().round(round).build();
        apply(entry, request);
        return toResponse(journalRepository.save(entry));
    }

    @Transactional
    public JournalResponse update(User user, Long entryId, JournalRequest request) {
        JournalEntry entry = require(user, entryId);
        apply(entry, request);
        return toResponse(journalRepository.save(entry));
    }

    @Transactional
    public void delete(User user, Long entryId) {
        JournalEntry entry = require(user, entryId);
        journalRepository.delete(entry);
    }

    /** Loads an entry, enforcing that it belongs to the calling user. */
    private JournalEntry require(User user, Long entryId) {
        JournalEntry entry = journalRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found."));
        Long ownerId = entry.getRound().getCompany().getUser().getId();
        if (!ownerId.equals(user.getId())) {
            throw new ResourceNotFoundException("Journal entry not found.");
        }
        return entry;
    }

    private void apply(JournalEntry entry, JournalRequest request) {
        entry.setTitle(blankToNull(request.title()));
        entry.setQuestionsAsked(request.questionsAsked());
        entry.setTopics(request.topics());
        entry.setWhatWentWell(request.whatWentWell());
        entry.setWhatFlopped(request.whatFlopped());
        entry.setResources(request.resources());
        entry.setRating(request.rating());
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
                e.getTitle(),
                e.getQuestionsAsked(),
                e.getTopics(),
                e.getWhatWentWell(),
                e.getWhatFlopped(),
                e.getResources(),
                e.getRating(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
