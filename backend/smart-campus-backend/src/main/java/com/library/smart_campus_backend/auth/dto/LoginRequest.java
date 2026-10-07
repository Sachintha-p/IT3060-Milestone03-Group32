package com.library.smart_campus_backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/auth/login.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Identifier is required")
    private String identifier;

    @NotBlank(message = "Portal type is required")
    private String portal;

    @NotBlank(message = "Password is required")
    private String password;
}
