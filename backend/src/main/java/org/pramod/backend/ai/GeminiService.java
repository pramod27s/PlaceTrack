package org.pramod.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.pramod.backend.ai.dto.AiDtos.ParsedCompanyResponse;
import org.pramod.backend.ai.dto.AiDtos.ParsedRoundResponse;
import org.pramod.backend.round.RoundMode;
import org.pramod.backend.round.RoundType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import org.pramod.backend.exception.AiServiceException;

import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Slf4j
@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String fallbackApiKey;
    private final String model;
    private final boolean thinkingEnabled;
    private final Clock clock;

    /** Per-request read timeout: generation regularly takes several seconds. */
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(12);
    /** Upper bound on the whole key/model/retry sequence for one user request. */
    private static final Duration TOTAL_BUDGET = Duration.ofSeconds(25);
    private static final int ATTEMPTS_PER_MODEL = 2;
    private static final long RETRY_BACKOFF_MS = 700;

    @Autowired
    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.fallback-key:}") String fallbackApiKey,
            @Value("${gemini.api.model:gemini-3.5-flash}") String model,
            @Value("${gemini.api.thinking-enabled:false}") boolean thinkingEnabled,
            ObjectMapper objectMapper,
            Clock clock) {
        this.apiKey = apiKey;
        this.fallbackApiKey = fallbackApiKey;
        this.model = model;
        this.thinkingEnabled = thinkingEnabled;
        this.objectMapper = objectMapper;
        this.clock = clock;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(READ_TIMEOUT);

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    public GeminiService(
            String apiKey,
            String fallbackApiKey,
            String model,
            ObjectMapper objectMapper) {
        this(apiKey, fallbackApiKey, model, false, objectMapper, Clock.system(ZoneId.of("Asia/Kolkata")));
    }

    public GeminiService(
            String apiKey,
            String model,
            ObjectMapper objectMapper) {
        this(apiKey, null, model, objectMapper);
    }

    public ParsedCompanyResponse parseCompanyNotice(String rawText) {
        return parseCompanyNotice(rawText, null);
    }

    public ParsedCompanyResponse parseCompanyNotice(String rawText, String userApiKey) {
        LocalDate today = LocalDate.now(clock);
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
            String jsonOutput = callGemini(prompt, userApiKey);
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
        return parseRoundNotice(rawText, null);
    }

    public ParsedRoundResponse parseRoundNotice(String rawText, String userApiKey) {
        LocalDate today = LocalDate.now(clock);
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
            String jsonOutput = callGemini(prompt, userApiKey);
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
        return callGemini(prompt, null);
    }

    private String callGemini(String prompt, String userApiKey) {
        List<String> candidateKeys = Stream.of(userApiKey, apiKey, fallbackApiKey)
                .filter(k -> k != null && !k.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        if (candidateKeys.isEmpty()) {
            throw new AiServiceException("Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.");
        }

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        generationConfig.put("maxOutputTokens", 800); 
        if (!thinkingEnabled) {
            generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", generationConfig
        );

        List<String> candidateModels = Stream.of(model, "gemini-3.5-flash", "gemini-3.6-flash")
                .filter(m -> m != null && !m.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
        String response = null;
        Failure lastFailure = null;
        long deadline = System.nanoTime() + TOTAL_BUDGET.toNanos();

        keyLoop:
        for (String currentKey : candidateKeys) {
            for (String currentModel : candidateModels) {
                for (int attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt++) {
                    if (System.nanoTime() > deadline) {
                        log.warn("Gemini call budget of {}s exhausted; giving up.", TOTAL_BUDGET.toSeconds());
                        break keyLoop;
                    }
                    try {
                        response = send(currentModel, currentKey, requestBody);
                        break keyLoop;
                    } catch (Exception e) {
                        lastFailure = classify(e);
                        log.warn("Gemini call failed (model={}, attempt={}): {} - {}",
                                currentModel, attempt, lastFailure, describe(e));

                        if (lastFailure == Failure.QUOTA || lastFailure == Failure.BAD_KEY) {
                            continue keyLoop; // this key is unusable; other models won't help
                        }
                        if (lastFailure == Failure.TRANSIENT && attempt < ATTEMPTS_PER_MODEL) {
                            sleepQuietly(RETRY_BACKOFF_MS * attempt);
                            continue; // retry the same model
                        }
                        break; // BAD_MODEL, BAD_REQUEST, OTHER, or retries used up: next model
                    }
                }
            }
        }

        if (response == null) {
            throw new AiServiceException(userMessage(lastFailure));
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

    /** Why a single Gemini call failed, derived from the HTTP status (not the message text). */
    private enum Failure { QUOTA, BAD_KEY, BAD_MODEL, BAD_REQUEST, TRANSIENT, OTHER }

    /** A non-2xx reply from Gemini, carrying the status so it can be classified. */
    private static final class GeminiHttpException extends RuntimeException {
        private final int status;
        private final String body;

        GeminiHttpException(int status, String body) {
            super("HTTP " + status);
            this.status = status;
            this.body = body;
        }
    }

    private String send(String model, String key, Map<String, Object> requestBody) {
        return restClient.post()
                .uri("/models/{model}:generateContent", model)
                // Header rather than ?key= so the key never appears in URLs, logs or error messages.
                .header("x-goog-api-key", key)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .exchange((req, res) -> {
                    String text = new String(res.getBody().readAllBytes(), StandardCharsets.UTF_8);
                    if (res.getStatusCode().is2xxSuccessful()) {
                        return text;
                    }
                    throw new GeminiHttpException(res.getStatusCode().value(), text);
                });
    }

    private static Failure classify(Exception e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof GeminiHttpException http) {
                return switch (http.status) {
                    case 429 -> Failure.QUOTA;
                    case 401, 403 -> Failure.BAD_KEY;
                    // Gemini reports a bad key as 400 with reason API_KEY_INVALID.
                    case 400 -> http.body.contains("API_KEY_INVALID") ? Failure.BAD_KEY : Failure.BAD_REQUEST;
                    case 404 -> Failure.BAD_MODEL;
                    case 500, 502, 503, 504 -> Failure.TRANSIENT;
                    default -> Failure.OTHER;
                };
            }
            if (t instanceof SocketTimeoutException || t instanceof ResourceAccessException) {
                return Failure.TRANSIENT;
            }
        }
        return Failure.OTHER;
    }

    private static String describe(Exception e) {
        if (e instanceof GeminiHttpException http) {
            String body = http.body.length() > 300 ? http.body.substring(0, 300) + "..." : http.body;
            return "HTTP " + http.status + ": " + body;
        }
        return e.getClass().getSimpleName() + ": " + e.getMessage();
    }

    private static String userMessage(Failure failure) {
        if (failure == null) {
            failure = Failure.TRANSIENT;
        }
        return switch (failure) {
            case QUOTA -> "Gemini AI quota reached. Please try again later or configure your own Gemini API key.";
            case BAD_KEY -> "Gemini API key is invalid or unauthorized. Please verify your API key.";
            case BAD_MODEL -> "The configured Gemini model is not available. Please check GEMINI_MODEL.";
            case BAD_REQUEST -> "Gemini rejected the request. Please try shortening or rephrasing the text.";
            case TRANSIENT -> "Google Gemini AI is temporarily experiencing high demand. Please try again in a few seconds.";
            case OTHER -> "AI service failed. Please try again.";
        };
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
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
