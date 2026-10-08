package com.library.smart_campus_backend.feature2.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature2.dto.AlertRequestDTO;
import com.library.smart_campus_backend.feature2.dto.AlertResponseDTO;
import com.library.smart_campus_backend.feature2.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT')")
public class AlertController {
    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<ApiResponse<AlertResponseDTO>> createAlert(
            @Valid @RequestBody AlertRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AlertResponseDTO alert = alertService.createAlert(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Alert created successfully", alert));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponseDTO>>> getMyAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AlertResponseDTO> alerts = alertService.getMyAlerts(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Alerts retrieved successfully", alerts));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertResponseDTO>> updateAlertChannels(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, List<com.library.smart_campus_backend.feature2.model.AlertChannel>> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<com.library.smart_campus_backend.feature2.model.AlertChannel> channels = request.get("channels");
        if (channels == null || channels.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "At least one channel is required");
        }
        
        AlertResponseDTO alert = alertService.updateAlertChannels(id, channels, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Alert updated successfully", alert));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<AlertResponseDTO>> markAlertRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AlertResponseDTO alert = alertService.markAlertRead(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Alert marked as read", alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        alertService.cancelAlert(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Alert cancelled successfully", null));
    }
}
