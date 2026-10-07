package com.library.smart_campus_backend.auth.service;

import com.library.smart_campus_backend.auth.dto.AuthResponse;
import com.library.smart_campus_backend.auth.dto.LoginRequest;
import com.library.smart_campus_backend.auth.dto.RegisterRequest;
import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.core.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Business logic for authentication.
 * Controller → AuthService → UserRepository.
 * Never returns User entities; always maps to AuthResponse DTOs.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ── Auth operations ───────────────────────────────────────────────

    /**
     * Registers a new STUDENT user.
     *
     * @param request validated registration data
     * @return JWT + user profile
     * @throws IllegalArgumentException if email is already taken
     */
    public AuthResponse register(RegisterRequest request) {
        // Guard: email must be unique
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        // Build and persist the new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT) // All self-registrations default to STUDENT
                .build();

        userRepository.save(user);

        // Return a signed JWT immediately so the user is logged in after registering
        String token = jwtUtil.generateToken(user);
        return buildResponse(user, token);
    }

    /**
     * Authenticates an existing user.
     *
     * @param request email + password
     * @return JWT + user profile
     * @throws org.springframework.security.authentication.BadCredentialsException if wrong credentials
     */
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException if credentials are wrong (handled by GlobalExceptionHandler)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(user);
        return buildResponse(user, token);
    }

    // ── Private helpers ───────────────────────────────────────────────

    /** Maps a User entity + token to the DTO returned to the client. */
    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
