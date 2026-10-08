package com.library.smart_campus_backend.feature4.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature4.dto.CreateUserRequest;
import com.library.smart_campus_backend.feature4.dto.UpdateRoleRequest;
import com.library.smart_campus_backend.feature4.dto.UpdateStatusRequest;
import com.library.smart_campus_backend.feature4.dto.UserSummaryDTO;
import com.library.smart_campus_backend.feature4.service.Feature4UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feature4/users")
@RequiredArgsConstructor
public class Feature4UserController {

    private final Feature4UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", userService.getUsers(q, role, status)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDTO>> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("User created", userService.createUser(request)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request,
            Authentication auth) {
        userService.updateUserRole(id, request.getRole(), auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Role updated", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            Authentication auth) {
        userService.updateUserStatus(id, request.getStatus(), auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Status updated", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id, Authentication auth) {
        userService.deleteUser(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }
}
