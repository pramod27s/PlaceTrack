package org.pramod.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Wire-format records for the authentication endpoints. */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 80) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
            String password) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record UserDto(Long id, String fullName, String email) {
    }

    public record AuthResponse(String token, UserDto user) {
    }
}
