package org.pramod.backend.round;

import org.pramod.backend.company.Company;
import org.pramod.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RoundRepository extends JpaRepository<Round, Long> {

    List<Round> findByCompanyOrderByScheduledAtAsc(Company company);

    List<Round> findByCompany_UserOrderByScheduledAtAsc(User user);

    @Query("SELECT r FROM Round r JOIN FETCH r.company c WHERE c.user = :user ORDER BY r.scheduledAt ASC")
    List<Round> findByUserWithCompany(@Param("user") User user);

    List<Round> findByCompany_UserAndScheduledAtBetweenOrderByScheduledAtAsc(
            User user, LocalDateTime from, LocalDateTime to);

    long countByCompany(Company company);

    long countByCompany_User(User user);
}
