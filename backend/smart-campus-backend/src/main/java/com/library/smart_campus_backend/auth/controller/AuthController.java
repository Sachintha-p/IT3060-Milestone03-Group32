package com.library.smart_campus_backend.auth.controller;

import com.library.smart_campus_backend.auth.dto.AuthResponse;
import com.library.smart_campus_backend.auth.dto.LoginRequest;
import com.library.smart_campus_backend.auth.dto.RegisterRequest;
import com.library.smart_campus_backend.auth.service.AuthService;
import com.library.smart_campus_backend.core.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication.
 *
 * Public endpoints (no JWT required):
 *   POST /api/auth/register  — create a new STUDENT account
 *   POST /api/auth/login     — authenticate and receive a JWT
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     * Returns HTTP 201 with the JWT and user profile on success.
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new student account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", authResponse));
    }

    /**
     * Login with email and password.
     * Returns HTTP 200 with the JWT and user profile on success.
     */
    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authResponse));
    }
}
