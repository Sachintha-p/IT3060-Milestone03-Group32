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
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "An account with this email already exists");
        }

        // Build and persist the new user – password is always encoded
        // Always assign STUDENT role for public registration
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
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
        User user = userRepository.findByEmailOrStudentId(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid email or password"));

        if ("SUSPENDED".equals(user.getStatus())) {
            throw new org.springframework.security.access.AccessDeniedException("Account is suspended");
        }

        boolean isStudentTab = "STUDENT".equals(request.getPortal());
        boolean isStudentAccount = user.getRole() == Role.STUDENT;

        if (isStudentTab && !isStudentAccount) {
            throw new IllegalArgumentException("This account belongs to the other portal");
        }
        if (!isStudentTab && isStudentAccount) {
            throw new IllegalArgumentException("This account belongs to the other portal");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid email or password");
        }

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


