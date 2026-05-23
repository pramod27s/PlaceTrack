package org.pramod.backend.round;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.company.Company;
import org.pramod.backend.company.CompanyService;
import org.pramod.backend.exception.ResourceNotFoundException;
import org.pramod.backend.journal.JournalRepository;
import org.pramod.backend.round.RoundDtos.ConflictDto;
import org.pramod.backend.round.RoundDtos.RoundRequest;
import org.pramod.backend.round.RoundDtos.RoundResponse;
import org.pramod.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoundService {

    private final RoundRepository roundRepository;
    private final JournalRepository journalRepository;
    private final CompanyService companyService;
    private final ConflictDetectionService conflictDetectionService;

    @Transactional(readOnly = true)
    public List<RoundResponse> listForCompany(User user, Long companyId) {
        Company company = companyService.require(user, companyId);
        List<Round> all = roundRepository.findByCompany_UserOrderByScheduledAtAsc(user);
        return roundRepository.findByCompanyOrderByScheduledAtAsc(company).stream()
                .map(r -> toResponse(r, all))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoundResponse> listForUser(User user) {
        List<Round> all = roundRepository.findByCompany_UserOrderByScheduledAtAsc(user);
        return all.stream().map(r -> toResponse(r, all)).toList();
    }

    /** Rounds scheduled from now through the next 7 days. */
    @Transactional(readOnly = true)
    public List<RoundResponse> listUpcoming(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<Round> all = roundRepository.findByCompany_UserOrderByScheduledAtAsc(user);
        List<Round> window = roundRepository.findByCompany_UserAndScheduledAtBetweenOrderByScheduledAtAsc(
                user, now, now.plusDays(7));
        return window.stream()
                .filter(r -> r.getStatus() == RoundStatus.SCHEDULED)
                .map(r -> toResponse(r, all))
                .toList();
    }

    @Transactional
    public RoundResponse create(User user, Long companyId, RoundRequest request) {
        Company company = companyService.require(user, companyId);
        Round round = Round.builder()
                .company(company)
                .build();
        apply(round, request);
        round = roundRepository.save(round);
        return toResponse(round, roundRepository.findByCompany_UserOrderByScheduledAtAsc(user));
    }

    @Transactional
    public RoundResponse update(User user, Long roundId, RoundRequest request) {
        Round round = require(user, roundId);
        apply(round, request);
        round = roundRepository.save(round);
        return toResponse(round, roundRepository.findByCompany_UserOrderByScheduledAtAsc(user));
    }

    @Transactional
    public void delete(User user, Long roundId) {
        Round round = require(user, roundId);
        journalRepository.deleteByRound(round);
        roundRepository.delete(round);
    }

    /** Loads a round, enforcing that it belongs to the calling user. */
    public Round require(User user, Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found."));
        if (!round.getCompany().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Round not found.");
        }
        return round;
    }

    private void apply(Round round, RoundRequest request) {
        round.setType(request.type());
        round.setTitle(blankToNull(request.title()));
        round.setScheduledAt(request.scheduledAt());
        round.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60);
        round.setMode(request.mode() != null ? request.mode() : RoundMode.ONLINE);
        round.setMeetingLink(blankToNull(request.meetingLink()));
        round.setLocation(blankToNull(request.location()));
        round.setStatus(request.status() != null ? request.status() : RoundStatus.SCHEDULED);
    }

    RoundResponse toResponse(Round round, List<Round> userRounds) {
        List<ConflictDto> conflicts = conflictDetectionService.findConflicts(round, userRounds).stream()
                .map(c -> new ConflictDto(
                        c.getId(), c.getCompany().getName(), c.getType(), c.getScheduledAt()))
                .toList();
        return new RoundResponse(
                round.getId(),
                round.getCompany().getId(),
                round.getCompany().getName(),
                round.getType(),
                round.getTitle(),
                round.getScheduledAt(),
                round.getDurationMinutes(),
                round.getMode(),
                round.getMeetingLink(),
                round.getLocation(),
                round.getStatus(),
                journalRepository.existsByRound(round),
                conflicts,
                round.getCreatedAt());
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
