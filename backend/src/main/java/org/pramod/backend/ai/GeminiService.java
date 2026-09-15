package org.pramod.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.pramod.backend.ai.dto.AiDtos.ParsedCompanyResponse;
import org.pramod.backend.ai.dto.AiDtos.ParsedRoundResponse;
import org.pramod.backend.round.RoundMode;
import org.pramod.backend.round.RoundType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import org.pramod.backend.exception.AiServiceException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.model:gemini-3.6-flash}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    public ParsedCompanyResponse parseCompanyNotice(String rawText) {
        LocalDate today = LocalDate.now();
        String prompt = """
                You are an AI assistant for a campus placement tracker called PlaceTrack.
                Your task is to extract structured placement information from raw WhatsApp messages, Superset announcements, emails, or job postings.
                Today's date is: %s (%s).
                Extract the following fields. If a field is not found or not mentioned in the text, return null for that field. DO NOT make up information.
                
                Fields:
                - name: string or null (The company name, e.g. 'Deloitte USI', 'Amazon', 'TCS')
                - role: string or null (The job role/title, e.g. 'Associate Analyst', 'SDE-1', 'Graduate Engineer Trainee')
                - ctc: string or null (The salary/CTC package, e.g. '7.6 LPA', '12 LPA', 'Rs. 45,000/month')
                - location: string or null (Job location, e.g. 'Bangalore', 'Pan India', 'Hyderabad / Pune')
                - jdLink: string or null (Any URL/link to the job description, Superset registration, or application form)
                - registeredOnSuperset: boolean or null (true if the text mentions Superset, Joinsuperset, or asks students to register on Superset, otherwise null)
                - researchNotes: string or null (Summary of key eligibility criteria, CGPA cutoff, eligible branches, test dates, or important instructions mentioned in the notice)
                - resumeVersion: string or null (The resume title, profile name, or version used to apply if mentioned in the text or confirmation, e.g. 'Master Resume updated', 'SDE-Resume-v2', 'SWE-Master')

                Raw Notice:
                \"\"\"
                %s
                \"\"\"

                Return strictly a JSON object with keys: name, role, ctc, location, jdLink, registeredOnSuperset, researchNotes, resumeVersion.
                """.formatted(today, today.getDayOfWeek(), rawText);

        try {
            String jsonOutput = callGemini(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);

            String name = textOrNull(node.get("name"));
            String role = textOrNull(node.get("role"));
            String ctc = textOrNull(node.get("ctc"));
            String location = textOrNull(node.get("location"));
            String jdLink = textOrNull(node.get("jdLink"));
            Boolean superset = (node.hasNonNull("registeredOnSuperset") && node.get("registeredOnSuperset").isBoolean())
                    ? (node.get("registeredOnSuperset").asBoolean() ? Boolean.TRUE : null)
                    : null;
            String researchNotes = textOrNull(node.get("researchNotes"));
            String resumeVersion = textOrNull(node.get("resumeVersion"));

            return new ParsedCompanyResponse(name, role, ctc, location, jdLink, superset, researchNotes, resumeVersion);
        } catch (Exception e) {
            log.error("Failed to parse company notice with Gemini: {}", e.getMessage(), e);
            if (e instanceof AiServiceException ase) {
                throw ase;
            }
            throw new AiServiceException("Failed to analyze notice with AI. " + e.getMessage());
        }
    }

    public ParsedRoundResponse parseRoundNotice(String rawText) {
        LocalDate today = LocalDate.now();
        String prompt = """
                You are an AI assistant for a campus placement tracker called PlaceTrack.
                Your task is to extract interview round and scheduling details from an interview invitation, email, or announcement.
                Extract the following fields. If a field is not found or not mentioned, return null for that field. DO NOT make up information.
                
                Calendar Reference:
                - Today is: %s (%s).
                - Resolve any relative date expressions like 'tomorrow', 'today', 'day after tomorrow', 'tonight', or weekday names like 'this Friday', 'next Monday' into the exact calendar date based on today (%s).
                
                Fields:
                - type: string or null (Must be one of: 'PPT', 'OA', 'GD', 'TECHNICAL', 'HR', 'OTHER'. PPT = Pre-placement talk, OA = Online Assessment/coding test, GD = Group Discussion, TECHNICAL = Technical/coding round, HR = HR/Managerial/Behavioral round, OTHER = other)
                - title: string or null (Short title for the round, e.g. 'Round 1 - Technical Interview', 'Online Assessment', 'HR Interview')
                - scheduledAt: string or null (Date and time formatted strictly as ISO-8601 'yyyy-MM-ddTHH:mm', e.g. '2026-09-15T16:00'. If time is 4 PM, convert to 24-hour time 16:00. If either date or time is missing, return null)
                - durationMinutes: integer or null (Duration in minutes, e.g. 45, 60, 90. Null if unspecified)
                - mode: string or null ('ONLINE' if Google Meet, Zoom, Teams, Chime, virtual; 'OFFLINE' if on-campus, auditorium, lab, or office)
                - meetingLink: string or null (Virtual meeting link such as meet.google.com, zoom.us, teams.microsoft.com, etc.)
                - location: string or null (Physical location or venue if offline, e.g. 'Auditorium 2', 'CSE Lab 3')

                Raw Notice:
                \"\"\"
                %s
                \"\"\"

                Return strictly a JSON object with keys: type, title, scheduledAt, durationMinutes, mode, meetingLink, location.
                """.formatted(today, today.getDayOfWeek(), today, rawText);

        try {
            String jsonOutput = callGemini(prompt);
            JsonNode node = objectMapper.readTree(jsonOutput);

            RoundType type = null;
            if (node.hasNonNull("type")) {
                try {
                    type = RoundType.valueOf(node.get("type").asText().trim().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                    type = RoundType.TECHNICAL;
                }
            }

            String title = textOrNull(node.get("title"));
            String scheduledAt = textOrNull(node.get("scheduledAt"));
            Integer durationMinutes = node.hasNonNull("durationMinutes") ? node.get("durationMinutes").asInt() : null;

            RoundMode mode = null;
            if (node.hasNonNull("mode")) {
                try {
                    mode = RoundMode.valueOf(node.get("mode").asText().trim().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                    mode = RoundMode.ONLINE;
                }
            }

            String meetingLink = textOrNull(node.get("meetingLink"));
            String location = textOrNull(node.get("location"));

            return new ParsedRoundResponse(type, title, scheduledAt, durationMinutes, mode, meetingLink, location);
        } catch (Exception e) {
            log.error("Failed to parse round notice with Gemini: {}", e.getMessage(), e);
            if (e instanceof AiServiceException ase) {
                throw ase;
            }
            throw new AiServiceException("Failed to analyze round invite with AI. " + e.getMessage());
        }
    }

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiServiceException("Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.");
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        List<String> candidateModels = List.of(model, "gemini-flash-latest", "gemini-3.5-flash");
        String response = null;
        Exception lastException = null;

        for (String currentModel : candidateModels) {
            int maxRetries = 2;
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    response = restClient.post()
                            .uri("/models/{model}:generateContent?key={apiKey}", currentModel, apiKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(requestBody)
                            .retrieve()
                            .body(String.class);
                    lastException = null;
                    break;
                } catch (Exception e) {
                    lastException = e;
                    String msg = e.getMessage() != null ? e.getMessage() : "";
                    if (attempt < maxRetries && (msg.contains("503") || msg.contains("429"))) {
                        log.warn("Gemini API transient spike for model {} on attempt {}. Retrying...", currentModel, attempt);
                        try {
                            Thread.sleep(1000L * attempt);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new AiServiceException("Interrupted during AI retry", ie);
                        }
                    } else {
                        break;
                    }
                }
            }
            if (response != null) {
                break;
            }
        }

        if (response == null) {
            String err = lastException != null && lastException.getMessage() != null ? lastException.getMessage() : "Unknown error";
            if (err.contains("429") || err.contains("RESOURCE_EXHAUSTED")) {
                throw new AiServiceException("Gemini AI free-tier quota reached for today. Please try again later or configure an upgraded Gemini API key.");
            } else if (err.contains("400") || err.contains("403") || err.contains("API_KEY_INVALID")) {
                throw new AiServiceException("Gemini API key is invalid or unauthorized. Please verify your GEMINI_API_KEY.");
            } else if (err.contains("503") || err.contains("UNAVAILABLE")) {
                throw new AiServiceException("Google Gemini AI is temporarily experiencing high demand. Please try again in a few seconds.");
            }
            throw new AiServiceException("AI service failed: " + err);
        }

        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
            throw new AiServiceException("Empty response received from Gemini.");
        } catch (AiServiceException ase) {
            throw ase;
        } catch (Exception e) {
            log.error("Failed to parse Gemini API response: {}", response, e);
            throw new AiServiceException("Failed to parse response from Gemini: " + e.getMessage());
        }
    }

    private String textOrNull(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        String s = node.asText().trim();
        return s.isEmpty() ? null : s;
    }
}
