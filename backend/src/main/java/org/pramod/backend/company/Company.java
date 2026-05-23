package org.pramod.backend.company;

import jakarta.persistence.*;
import lombok.*;
import org.pramod.backend.user.User;

import java.time.Instant;
import java.time.LocalDate;

/**
 * A single company a student has applied to — one card on the Kanban board.
 */
@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    private String role;

    /** Free-text CTC, e.g. "18 LPA" or "12 base + 4 joining bonus". */
    private String ctc;

    private String location;

    @Column(length = 1000)
    private String jdLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Stage stage;

    private LocalDate appliedOn;

    /** Confirms the TPO-portal (Superset) registration step is done. */
    @Column(nullable = false)
    private boolean registeredOnSuperset;

    @Column(columnDefinition = "text")
    private String researchNotes;

    /** Label of the resume version submitted to this company. */
    private String resumeVersion;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (stage == null) {
            stage = Stage.APPLIED;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
