package org.pramod.backend.round;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Pure scheduling logic: finds rounds whose time windows overlap. Two rounds
 * conflict when {@code startA < endB AND startB < endA}. Cancelled rounds are
 * ignored.
 */
@Service
public class ConflictDetectionService {

    /**
     * Returns rounds from {@code candidates} that overlap {@code target},
     * excluding {@code target} itself.
     */
    public List<Round> findConflicts(Round target, List<Round> candidates) {
        LocalDateTime targetStart = target.getScheduledAt();
        LocalDateTime targetEnd = endOf(target);
        return candidates.stream()
                .filter(r -> !r.getId().equals(target.getId()))
                .filter(r -> r.getStatus() != RoundStatus.CANCELLED)
                .filter(r -> overlaps(targetStart, targetEnd, r.getScheduledAt(), endOf(r)))
                .toList();
    }

    private static boolean overlaps(LocalDateTime aStart, LocalDateTime aEnd,
                                    LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    private static LocalDateTime endOf(Round round) {
        int minutes = round.getDurationMinutes() != null ? round.getDurationMinutes() : 60;
        return round.getScheduledAt().plusMinutes(minutes);
    }
}
