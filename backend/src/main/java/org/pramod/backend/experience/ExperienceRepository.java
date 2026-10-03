package org.pramod.backend.experience;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    @Query("""
        SELECT e FROM Experience e
        WHERE (:query IS NULL OR :query = '' OR
               LOWER(e.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(e.role) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(e.topics) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(e.questionsAsked) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:company IS NULL OR :company = '' OR LOWER(e.companyName) = LOWER(:company))
          AND (:driveType IS NULL OR e.driveType = :driveType)
          AND (:verdict IS NULL OR e.verdict = :verdict)
          AND (:difficulty IS NULL OR e.difficulty = :difficulty)
        ORDER BY
          CASE WHEN :sortBy = 'helpful' THEN e.helpfulCount END DESC,
          e.createdAt DESC
    """)
    List<Experience> searchExperiences(
            @Param("query") String query,
            @Param("company") String company,
            @Param("driveType") DriveType driveType,
            @Param("verdict") Verdict verdict,
            @Param("difficulty") Difficulty difficulty,
            @Param("sortBy") String sortBy
    );

    List<Experience> findAllByOrderByCreatedAtDesc();

    /** Loads a post with a row lock so concurrent "helpful" toggles are serialised. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Experience e WHERE e.id = :id")
    Optional<Experience> findByIdForUpdate(@Param("id") Long id);
}
