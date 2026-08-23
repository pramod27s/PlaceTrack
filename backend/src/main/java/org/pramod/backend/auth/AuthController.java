package org.pramod.backend.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.pramod.backend.auth.AuthDtos.AuthResponse;
import org.pramod.backend.auth.AuthDtos.LoginRequest;
import org.pramod.backend.auth.AuthDtos.RegisterRequest;
import org.pramod.backend.auth.AuthDtos.UserDto;
import org.pramod.backend.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }

    /** Returns the currently authenticated user — used by the frontend to rehydrate a session. */
    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal User user) {
        return authService.toDto(user);
    }
}
