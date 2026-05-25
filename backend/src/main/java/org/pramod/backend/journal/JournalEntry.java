package org.pramod.backend.journal;

import jakarta.persistence.*;
import lombok.*;
import org.pramod.backend.round.Round;

import java.time.Instant;

/**
 * A structured reflection logged after a round — the building block of the
 * student's personal interview-prep dataset. A round can have many entries
 * (e.g. immediate notes, a fuller reflection the next day).
 */
@Entity
@Table(name = "journal_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "round_id")
    private Round round;

    /** Optional short label, e.g. "Immediate notes" or "Day-after reflection". */
    @Column(length = 120)
    private String title;

    @Column(columnDefinition = "text")
    private String questionsAsked;

    @Column(columnDefinition = "text")
    private String topics;

    @Column(columnDefinition = "text")
    private String whatWentWell;

    @Column(columnDefinition = "text")
    private String whatFlopped;

    @Column(columnDefinition = "text")
    private String resources;

    /** Self-rated performance, 1-5. */
    private Integer rating;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
