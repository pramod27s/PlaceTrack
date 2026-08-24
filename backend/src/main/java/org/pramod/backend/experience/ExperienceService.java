package org.pramod.backend.experience;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.exception.BadRequestException;
import org.pramod.backend.exception.ResourceNotFoundException;
import org.pramod.backend.experience.ExperienceDtos.ExperienceRequest;
import org.pramod.backend.experience.ExperienceDtos.ExperienceResponse;
import org.pramod.backend.journal.JournalEntry;
import org.pramod.backend.journal.JournalRepository;
import org.pramod.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final JournalRepository journalRepository;

    @Transactional(readOnly = true)
    public List<ExperienceResponse> search(User currentUser,
                                          String query,
                                          String company,
                                          DriveType driveType,
                                          Verdict verdict,
                                          Difficulty difficulty,
                                          String sortBy) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanCompany = (company != null && !company.trim().isEmpty()) ? company.trim() : null;
        String cleanSortBy = "helpful".equalsIgnoreCase(sortBy) ? "helpful" : "latest";

        return experienceRepository.searchExperiences(
                cleanQuery,
                cleanCompany,
                driveType,
                verdict,
                difficulty,
                cleanSortBy
        ).stream().map(exp -> toResponse(exp, currentUser)).toList();
    }

    @Transactional(readOnly = true)
    public ExperienceResponse get(User currentUser, Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience post not found with id " + id));
        return toResponse(experience, currentUser);
    }

    @Transactional
    public ExperienceResponse create(User user, ExperienceRequest request) {
        String authorName = user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : "Student";

        Experience experience = Experience.builder()
                .user(user)
                .authorName(authorName)
                .authorBatch(request.authorBatch())
                .isAnonymous(request.anonymous())
                .companyName(request.companyName().trim())
                .role(request.role().trim())
                .ctc(request.ctc() != null ? request.ctc().trim() : null)
                .location(request.location() != null ? request.location().trim() : null)
                .driveType(request.driveType())
                .verdict(request.verdict())
                .difficulty(request.difficulty())
                .title(request.title().trim())
                .summary(request.summary())
                .roundsDetails(request.roundsDetails())
                .questionsAsked(request.questionsAsked())
                .topics(request.topics())
                .tips(request.tips())
                .helpfulCount(0)
                .build();

        Experience saved = experienceRepository.save(experience);

        if (request.journalEntryId() != null) {
            journalRepository.findById(request.journalEntryId()).ifPresent(j -> {
                if (j.getRound().getCompany().getUser().getId().equals(user.getId())) {
                    j.setShared(true);
                    journalRepository.save(j);
                }
            });
        }

        return toResponse(saved, user);
    }


    @Transactional
    public void delete(User user, Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience post not found with id " + id));

        if (!experience.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this experience.");
        }

        experienceRepository.delete(experience);
    }

    @Transactional
    public ExperienceResponse toggleHelpful(User currentUser, Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience post not found with id " + id));

        if (currentUser != null) {
            if (experience.getHelpfulUserIds() == null) {
                experience.setHelpfulUserIds(new java.util.HashSet<>());
            }
            if (experience.getHelpfulUserIds().contains(currentUser.getId())) {
                experience.getHelpfulUserIds().remove(currentUser.getId());
            } else {
                experience.getHelpfulUserIds().add(currentUser.getId());
            }
            experience.setHelpfulCount(experience.getHelpfulUserIds().size());
        }

        Experience saved = experienceRepository.save(experience);
        return toResponse(saved, currentUser);
    }

    public ExperienceResponse toResponse(Experience experience, User currentUser) {
        boolean isAuthor = currentUser != null &&
                experience.getUser() != null &&
                currentUser.getId().equals(experience.getUser().getId());

        boolean hasLiked = currentUser != null &&
                experience.getHelpfulUserIds() != null &&
                experience.getHelpfulUserIds().contains(currentUser.getId());

        String displayAuthor = experience.isAnonymous()
                ? (isAuthor ? experience.getAuthorName() + " (You - Anonymous)" : "Anonymous Student")
                : experience.getAuthorName();

        String displayBatch = experience.getAuthorBatch() != null && !experience.getAuthorBatch().isBlank()
                ? experience.getAuthorBatch()
                : (experience.isAnonymous() ? "Verified Student" : null);

        return new ExperienceResponse(
                experience.getId(),
                displayAuthor,
                displayBatch,
                experience.isAnonymous(),
                isAuthor,
                hasLiked,
                experience.getCompanyName(),
                experience.getRole(),
                experience.getCtc(),
                experience.getLocation(),
                experience.getDriveType(),
                experience.getVerdict(),
                experience.getDifficulty(),
                experience.getTitle(),
                experience.getSummary(),
                experience.getRoundsDetails(),
                experience.getQuestionsAsked(),
                experience.getTopics(),
                experience.getTips(),
                experience.getHelpfulCount(),
                experience.getCreatedAt(),
                experience.getUpdatedAt()
        );
    }
}

