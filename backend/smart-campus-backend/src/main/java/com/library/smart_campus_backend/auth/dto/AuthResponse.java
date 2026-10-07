package com.library.smart_campus_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body returned after a successful login or registration.
 * The token is a signed JWT that the client stores and sends in the
 * Authorization: Bearer <token> header for all subsequent requests.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    /** Signed JWT (expires after the configured jwt.expiration ms). */
    private String token;

    /** The authenticated user's database ID. */
    private Long id;

    /** Display name. */
    private String name;

    /** Email / username used for login. */
    private String email;

    /** "STUDENT" or "ADMIN" — used by the frontend to show/hide admin screens. */
    private String role;
}
