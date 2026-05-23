package org.pramod.backend.analytics;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.analytics.AnalyticsDtos.AnalyticsOverview;
import org.pramod.backend.analytics.AnalyticsDtos.FunnelStep;
import org.pramod.backend.company.Company;
import org.pramod.backend.company.CompanyRepository;
import org.pramod.backend.company.Stage;
import org.pramod.backend.journal.JournalRepository;
import org.pramod.backend.round.Round;
import org.pramod.backend.round.RoundRepository;
import org.pramod.backend.round.RoundStatus;
import org.pramod.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    /** The forward pipeline order used to compute the conversion funnel. */
    private static final List<Stage> PIPELINE = List.of(
            Stage.APPLIED, Stage.OA, Stage.SHORTLISTED, Stage.GD,
            Stage.TECH, Stage.HR, Stage.OFFER);

    private static final Map<Stage, String> FUNNEL_LABELS = Map.of(
            Stage.APPLIED, "Applied",
            Stage.OA, "Online Assessment",
            Stage.SHORTLISTED, "Shortlisted",
            Stage.GD, "Group Discussion",
            Stage.TECH, "Technical",
            Stage.HR, "HR Round",
            Stage.OFFER, "Offer");

    private final CompanyRepository companyRepository;
    private final RoundRepository roundRepository;
    private final JournalRepository journalRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverview overview(User user) {
        List<Company> companies = companyRepository.findByUserOrderByUpdatedAtDesc(user);
        List<Round> rounds = roundRepository.findByCompany_UserOrderByScheduledAtAsc(user);

        long total = companies.size();

        Map<Stage, Long> stageCounts = new EnumMap<>(Stage.class);
        for (Stage stage : Stage.values()) {
            stageCounts.put(stage, 0L);
        }
        for (Company company : companies) {
            stageCounts.merge(company.getStage(), 1L, Long::sum);
        }

        long offers = stageCounts.get(Stage.OFFER);
        long rejections = stageCounts.get(Stage.REJECTED);
        long active = total - offers - rejections;

        // Funnel: how many non-rejected companies reached at least each stage.
        List<FunnelStep> funnel = PIPELINE.stream()
                .map(stage -> new FunnelStep(
                        FUNNEL_LABELS.get(stage),
                        companies.stream()
                                .filter(c -> c.getStage() != Stage.REJECTED)
                                .filter(c -> reached(c.getStage(), stage))
                                .count()))
                .toList();

        long reachedShortlist = companies.stream()
                .filter(c -> c.getStage() != Stage.REJECTED)
                .filter(c -> reached(c.getStage(), Stage.SHORTLISTED))
                .count();

        double shortlistRate = total == 0 ? 0.0 : round1((reachedShortlist * 100.0) / total);
        double offerRate = total == 0 ? 0.0 : round1((offers * 100.0) / total);

        LocalDateTime now = LocalDateTime.now();
        long completedRounds = rounds.stream()
                .filter(r -> r.getStatus() == RoundStatus.COMPLETED
                        || r.getStatus() == RoundStatus.CLEARED
                        || r.getStatus() == RoundStatus.FAILED)
                .count();
        long upcomingRounds = rounds.stream()
                .filter(r -> r.getStatus() == RoundStatus.SCHEDULED)
                .filter(r -> r.getScheduledAt().isAfter(now))
                .count();

        long journalEntries = journalRepository
                .findByRound_Company_UserOrderByUpdatedAtDesc(user).size();

        return new AnalyticsOverview(
                total, active, offers, rejections,
                shortlistRate, offerRate, stageCounts, funnel,
                rounds.size(), completedRounds, upcomingRounds, journalEntries);
    }

    /** True when {@code current} is at or beyond {@code target} in the pipeline. */
    private static boolean reached(Stage current, Stage target) {
        int currentIndex = PIPELINE.indexOf(current);
        int targetIndex = PIPELINE.indexOf(target);
        return currentIndex >= targetIndex && currentIndex >= 0;
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
