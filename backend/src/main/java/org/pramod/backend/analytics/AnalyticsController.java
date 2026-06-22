package org.pramod.backend.analytics;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.analytics.AnalyticsDtos.AnalyticsOverview;
import org.pramod.backend.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {


    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public AnalyticsOverview overview(@AuthenticationPrincipal User user) {
        return analyticsService.overview(user);
    }
}
