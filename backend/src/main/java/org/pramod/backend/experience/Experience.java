package org.pramod.backend.experience;

import jakarta.persistence.*;
import lombok.*;
import org.pramod.backend.user.User;

import java.time.Instant;

/**
 * A community interview experience shared by a student for peer review and prep.
 */
@Entity
@Table(name = "community_experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String authorName;

    private String authorBatch;

    @Column(nullable = false)
    private boolean isAnonymous;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String role;

    private String ctc;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriveType driveType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Verdict verdict;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String summary;

    @Column(columnDefinition = "text")
    private String roundsDetails;

    @Column(columnDefinition = "text")
    private String questionsAsked;

    @Column(columnDefinition = "text")
    private String topics;

    @Column(columnDefinition = "text")
    private String tips;

    @Column(nullable = false)
    @Builder.Default
    private int helpfulCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "experience_helpful_users",
            joinColumns = @JoinColumn(name = "experience_id")
    )
    @Column(name = "user_id")
    @Builder.Default
    private java.util.Set<Long> helpfulUserIds = new java.util.HashSet<>();

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
