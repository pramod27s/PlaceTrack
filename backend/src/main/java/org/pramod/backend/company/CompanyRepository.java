package org.pramod.backend.company;

import org.pramod.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByUserOrderByUpdatedAtDesc(User user);

    @Query("""
        SELECT c, COUNT(r)
        FROM Company c
        LEFT JOIN Round r ON r.company = c
        WHERE c.user = :user
        GROUP BY c
        ORDER BY c.updatedAt DESC
    """)
    List<Object[]> findByUserWithRoundCount(@Param("user") User user);

    Optional<Company> findByIdAndUser(Long id, User user);

    long countByUser(User user);
}
