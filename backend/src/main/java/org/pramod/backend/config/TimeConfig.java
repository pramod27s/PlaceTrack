package org.pramod.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * The application clock. Round times are stored as zone-less local times in
 * the users' timezone, so "now" must be read in that same zone rather than the
 * host's (which is UTC on most cloud platforms).
 */
@Configuration
public class TimeConfig {

    @Bean
    Clock clock(@Value("${app.timezone:Asia/Kolkata}") String timezone) {
        return Clock.system(ZoneId.of(timezone));
    }
}
