package org.pramod.backend.journal;

import org.pramod.backend.round.Round;
import org.pramod.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface JournalRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByRoundOrderByCreatedAtAsc(Round round);

    List<JournalEntry> findByRound_Company_UserOrderByUpdatedAtDesc(User user);

    @Query("SELECT DISTINCT j.round.id FROM JournalEntry j WHERE j.round.company.user = :user")
    Set<Long> findRoundIdsWithJournalByUser(@Param("user") User user);

    boolean existsByRound(Round round);

    void deleteByRound(Round round);
}
