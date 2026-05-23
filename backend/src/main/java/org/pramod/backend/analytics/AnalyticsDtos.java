package org.pramod.backend.analytics;

import org.pramod.backend.company.Stage;

import java.util.List;
import java.util.Map;

/** Wire-format records for the analytics dashboard. */
public final class AnalyticsDtos {

    private AnalyticsDtos() {
    }

    /** A single bar of the conversion funnel. */
    public record FunnelStep(String label, long count) {
    }

    public record AnalyticsOverview(
            long totalCompanies,
            long activeCompanies,
            long offers,
            long rejections,
            double shortlistRate,
            double offerRate,
            Map<Stage, Long> stageCounts,
            List<FunnelStep> funnel,
            long totalRounds,
            long completedRounds,
            long upcomingRounds,
            long journalEntries) {
    }
}
