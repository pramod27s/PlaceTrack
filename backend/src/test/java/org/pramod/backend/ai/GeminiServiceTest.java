package org.pramod.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.pramod.backend.ai.dto.AiDtos.ParsedCompanyResponse;
import org.pramod.backend.ai.dto.AiDtos.ParsedRoundResponse;
import org.pramod.backend.round.RoundMode;
import org.pramod.backend.round.RoundType;

import java.io.InputStream;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        String apiKey = resolveApiKey();
        Assumptions.assumeTrue(apiKey != null && !apiKey.isBlank(), "Skipping test: GEMINI_API_KEY is not configured");
        geminiService = new GeminiService(apiKey, "gemini-3.6-flash", new ObjectMapper());
    }

    private static String resolveApiKey() {
        String key = System.getProperty("gemini.api.key");
        if (key != null && !key.isBlank()) return key;

        key = System.getenv("GEMINI_API_KEY");
        if (key != null && !key.isBlank()) return key;

        try (InputStream is = GeminiServiceTest.class.getResourceAsStream("/application-secrets.properties")) {
            if (is != null) {
                Properties props = new Properties();
                props.load(is);
                return props.getProperty("GEMINI_API_KEY");
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    @Test
    void testParseCompanyNotice() {
        String notice = """
                Campus Drive Announcement: Deloitte USI
                Role: Associate Analyst (SDE)
                Package: 7.6 LPA
                Location: Bengaluru / Hyderabad
                Registration link on Superset: https://app.joinsuperset.com/join/#/signup/student/jobprofiles/deloitte
                Eligible branches: CSE, ISE, ECE.
                Cutoff: 60% / 6.5 CGPA throughout.
                You applied with resume : Master Resume updated.
                """;

        ParsedCompanyResponse parsed = geminiService.parseCompanyNotice(notice);

        assertNotNull(parsed);
        assertNotNull(parsed.name());
        assertTrue(parsed.name().toLowerCase().contains("deloitte"), "Expected company name to contain Deloitte");
        assertNotNull(parsed.role());
        assertTrue(parsed.role().toLowerCase().contains("analyst"), "Expected role to contain Analyst");
        assertNotNull(parsed.ctc());
        assertTrue(parsed.ctc().contains("7.6"), "Expected CTC to contain 7.6");
        assertTrue(parsed.registeredOnSuperset(), "Expected Superset to be true");
        assertNotNull(parsed.jdLink());
        assertTrue(parsed.jdLink().contains("joinsuperset.com"), "Expected JD link to be extracted");
        assertNotNull(parsed.resumeVersion());
        assertTrue(parsed.resumeVersion().toLowerCase().contains("master resume"), "Expected resume version to be extracted");
    }

    @Test
    void testParseRoundNotice() {
        String notice = """
                Hi Candidates,
                Your Technical Interview Round 1 with Amazon is confirmed for 2026-10-18 at 3:00 PM IST (45 mins).
                Join here: https://meet.google.com/xyz-abcd-efg
                Keep your college ID and resume ready.
                """;

        ParsedRoundResponse parsed = geminiService.parseRoundNotice(notice);

        assertNotNull(parsed);
        assertEquals(RoundType.TECHNICAL, parsed.type());
        assertEquals(45, parsed.durationMinutes());
        assertEquals(RoundMode.ONLINE, parsed.mode());
        assertNotNull(parsed.meetingLink());
        assertTrue(parsed.meetingLink().contains("meet.google.com"), "Expected meeting link to be extracted");
        assertNotNull(parsed.scheduledAt());
    }
}
