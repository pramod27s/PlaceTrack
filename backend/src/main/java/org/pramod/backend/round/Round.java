package org.pramod.backend.round;

import jakarta.persistence.*;
import lombok.*;
import org.pramod.backend.company.Company;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * A single scheduled stage of a company's process (OA, technical interview, ...).
 */
@Entity
@Table(name = "rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundType type;

    /** Optional human label, e.g. "DSA round" or "System design". */
    private String title;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    /** Used for conflict detection between overlapping rounds. */
    @Column(nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundMode mode;

    @Column(length = 1000)
    private String meetingLink;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        if (durationMinutes == null) {
            durationMinutes = 60;
        }
        if (mode == null) {
            mode = RoundMode.ONLINE;
        }
        if (status == null) {
            status = RoundStatus.SCHEDULED;
        }
    }
}
