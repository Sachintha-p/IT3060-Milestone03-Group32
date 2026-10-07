package com.library.smart_campus_backend.core.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standardised error response body.
 * Returned by GlobalExceptionHandler for all error cases.
 *
 * Example JSON:
 * {
 *   "timestamp": "2026-10-01T12:00:00",
 *   "status": 400,
 *   "error": "Validation Error",
 *   "message": "email: must not be blank",
 *   "path": "/api/auth/register",
 *   "errors": ["email: must not be blank", "password: size must be between 6 and 100"]
 * }
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {

    /** Timestamp of the error. */
    private LocalDateTime timestamp;

    /** HTTP status code (e.g. 400, 401, 404). */
    private int status;

    /** Short error category (e.g. "Bad Request", "Unauthorized"). */
    private String error;

    /** Human-readable message. */
    private String message;

    /** Request path that caused the error. */
    private String path;

    /** List of validation messages (only populated for 400 errors). */
    private List<String> errors;
}
