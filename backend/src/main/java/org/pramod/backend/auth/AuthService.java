package org.pramod.backend.auth;

import lombok.RequiredArgsConstructor;
import org.pramod.backend.auth.AuthDtos.AuthResponse;
import org.pramod.backend.auth.AuthDtos.LoginRequest;
import org.pramod.backend.auth.AuthDtos.RegisterRequest;
import org.pramod.backend.auth.AuthDtos.UserDto;
import org.pramod.backend.exception.BadRequestException;
import org.pramod.backend.security.JwtService;
import org.pramod.backend.user.User;
import org.pramod.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }
        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }
        return toResponse(user);
    }

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getFullName(), user.getEmail());
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), toDto(user));
    }
}
