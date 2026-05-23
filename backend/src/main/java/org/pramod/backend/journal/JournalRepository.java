package org.pramod.backend.journal;

import org.pramod.backend.round.Round;
import org.pramod.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JournalRepository extends JpaRepository<JournalEntry, Long> {

    Optional<JournalEntry> findByRound(Round round);

    Optional<JournalEntry> findByRound_Id(Long roundId);

    List<JournalEntry> findByRound_Company_UserOrderByUpdatedAtDesc(User user);

    boolean existsByRound(Round round);

    void deleteByRound(Round round);
}
