package org.pramod.backend.ai;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.ai.dto.AiDtos.ParseNoticeRequest;
import org.pramod.backend.ai.dto.AiDtos.ParsedCompanyResponse;
import org.pramod.backend.ai.dto.AiDtos.ParsedRoundResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/parse-company-notice")
    public ResponseEntity<ParsedCompanyResponse> parseCompanyNotice(
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String userApiKey,
            @Valid @RequestBody ParseNoticeRequest request) {
        ParsedCompanyResponse response = geminiService.parseCompanyNotice(request.rawText(), userApiKey);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/parse-round-notice")
    public ResponseEntity<ParsedRoundResponse> parseRoundNotice(
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String userApiKey,
            @Valid @RequestBody ParseNoticeRequest request) {
        ParsedRoundResponse response = geminiService.parseRoundNotice(request.rawText(), userApiKey);
        return ResponseEntity.ok(response);
    }
}
