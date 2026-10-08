package com.library.smart_campus_backend.feature3.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature1.dto.OccupancySummaryDTO;
import com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO;
import com.library.smart_campus_backend.feature1.dto.ZoneSummaryDTO;
import com.library.smart_campus_backend.feature1.model.Zone;
import com.library.smart_campus_backend.feature1.service.SpaceService;
import com.library.smart_campus_backend.feature2.dto.BookDTO;
import com.library.smart_campus_backend.feature2.dto.UpdateBookStatusDTO;
import com.library.smart_campus_backend.feature2.service.BookService;
import com.library.smart_campus_backend.feature3.dto.StaffAlertDTO;
import com.library.smart_campus_backend.feature3.dto.UpdateAlertStatusDTO;
import com.library.smart_campus_backend.feature3.service.Feature3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/feature3")
@RequiredArgsConstructor
public class Feature3Controller {

    private final Feature3Service feature3Service;
    private final SpaceService spaceService;
    private final BookService bookService;

    // --- Dashboard & Occupancy ---

    @GetMapping("/dashboard")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.library.smart_campus_backend.feature3.dto.Feature3DashboardDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard retrieved", feature3Service.getDashboard(spaceService)));
    }

    // --- Settings ---
    @GetMapping("/settings")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok("Settings retrieved", feature3Service.getSettings()));
    }

    @PutMapping("/settings")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO>> updateSettings(@RequestBody com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Settings updated", feature3Service.updateSettings(req)));
    }

    // --- Shelving / Book Updates ---

    @PatchMapping("/books/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.library.smart_campus_backend.feature3.dto.Feature3BookDTO>> updateBookStatus(
            @PathVariable Long id,
            @RequestBody com.library.smart_campus_backend.feature3.dto.UpdateFeature3BookStatusDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Book status updated", feature3Service.updateBookStatus(id, request.getStatus())));
    }
    
    @GetMapping("/books")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<com.library.smart_campus_backend.feature3.dto.Feature3BookDTO>>> searchBooks(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok("Books retrieved", feature3Service.searchBooks(q)));
    }

    @GetMapping("/books/{id}/logs")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<com.library.smart_campus_backend.feature3.dto.Feature3ShelvingLogDTO>>> getShelvingLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Shelving logs retrieved", feature3Service.getShelvingLogs(id)));
    }

    // --- Zones / Spaces ---
    @GetMapping("/zones/{zoneName}/spaces")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<SpaceSummaryDTO>>> getZoneSpaces(@PathVariable String zoneName) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Spaces retrieved", spaceService.getSpaces(null, List.of(Zone.valueOf(zoneName)), null, null)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.ok("Invalid zone - gracefully returning empty", java.util.List.of()));
        }
    }

    @PatchMapping("/spaces/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO>> updateSpaceStatus(
            @PathVariable Long id,
            @RequestBody com.library.smart_campus_backend.feature3.dto.UpdateSpaceStatusDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Space updated", feature3Service.updateSpaceStatus(id, request.getStatus())));
    }

    // --- Staff Alerts ---

    @GetMapping("/alerts")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<StaffAlertDTO>>> getAlerts(@RequestParam(required = false) String range) {
        return ResponseEntity.ok(ApiResponse.ok("Alerts retrieved", feature3Service.getAlerts(range)));
    }

    @PatchMapping("/alerts/{id}/resolve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<StaffAlertDTO>> resolveAlert(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Alert resolved", feature3Service.resolveAlert(id)));
    }
    
    @PatchMapping("/alerts/read-all")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        feature3Service.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("All alerts marked read", null));
    }

    @PostMapping("/alerts")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<StaffAlertDTO>> createAlert(@RequestBody StaffAlertDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Alert created", feature3Service.createManualAlert(req)));
    }

    @DeleteMapping("/alerts/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@PathVariable Long id) {
        feature3Service.deleteAlert(id);
        return ResponseEntity.ok(ApiResponse.ok("Alert deleted", null));
    }
}
