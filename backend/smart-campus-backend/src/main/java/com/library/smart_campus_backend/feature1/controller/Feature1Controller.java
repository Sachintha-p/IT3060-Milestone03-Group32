package com.library.smart_campus_backend.feature1.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.dto.*;
import com.library.smart_campus_backend.feature1.model.*;
import com.library.smart_campus_backend.feature1.repository.*;
import com.library.smart_campus_backend.feature1.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.io.PrintWriter;
import java.io.StringWriter;

@RestController
@RequestMapping("/api/feature1")
@RequiredArgsConstructor
public class Feature1Controller {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(sw.toString());
    }

    private final SavedFilterRepository savedFilterRepository;
    private final ZoneAlertRepository zoneAlertRepository;
    private final UserRepository userRepository;
    private final ReservationService reservationService;
    private final Clock clock;

    // ----- Saved Filters -----

    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<SavedFilterDTO>> getFilters(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails.getUsername());
        SavedFilter filter = savedFilterRepository.findByUserId(user.getId()).orElse(null);
        if (filter == null) {
            return ResponseEntity.ok(ApiResponse.ok("No filters saved", null));
        }
        return ResponseEntity.ok(ApiResponse.ok("Filters retrieved", mapFilter(filter)));
    }

    @PutMapping("/filters")
    public ResponseEntity<ApiResponse<SavedFilterDTO>> saveFilters(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SavedFilterDTO dto) {
        
        User user = getUser(userDetails.getUsername());
        SavedFilter filter = savedFilterRepository.findByUserId(user.getId())
                .orElse(SavedFilter.builder().user(user).build());
        
        filter.setFloor(dto.getFloor());
        filter.setZone(dto.getZone());
        filter.setHasPower(dto.getHasPower());
        filter.setHasPc(dto.getHasPc());
        filter.setUpdatedAt(LocalDateTime.now(clock));
        
        filter = savedFilterRepository.save(filter);
        return ResponseEntity.ok(ApiResponse.ok("Filters saved", mapFilter(filter)));
    }

    private SavedFilterDTO mapFilter(SavedFilter filter) {
        return SavedFilterDTO.builder()
                .id(filter.getId())
                .floor(filter.getFloor())
                .zone(filter.getZone())
                .hasPower(filter.getHasPower())
                .hasPc(filter.getHasPc())
                .updatedAt(filter.getUpdatedAt())
                .build();
    }

    // ----- Zone Alerts -----

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<ZoneAlertDTO>>> getAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails.getUsername());
        List<ZoneAlert> alerts = zoneAlertRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<ZoneAlertDTO> dtos = alerts.stream().map(a -> ZoneAlertDTO.builder()
                .id(a.getId())
                .zone(a.getZone())
                .active(a.getActive())
                .createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Alerts retrieved", dtos));
    }

    @PostMapping("/alerts")
    public ResponseEntity<ApiResponse<ZoneAlertDTO>> createAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ZoneAlertRequest req) {
        
        User user = getUser(userDetails.getUsername());
        ZoneAlert alert = ZoneAlert.builder()
                .user(user)
                .zone(req.getZone())
                .active(true)
                .createdAt(LocalDateTime.now(clock))
                .build();
        
        alert = zoneAlertRepository.save(alert);
        ZoneAlertDTO dto = ZoneAlertDTO.builder()
                .id(alert.getId())
                .zone(alert.getZone())
                .active(alert.getActive())
                .createdAt(alert.getCreatedAt())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Alert created", dto));
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        User user = getUser(userDetails.getUsername());
        ZoneAlert alert = zoneAlertRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
        
        zoneAlertRepository.delete(alert);
        return ResponseEntity.ok(ApiResponse.ok("Alert deleted", null));
    }

    // ----- PATCH update slot -----

    @PatchMapping("/reservations/{id}/slot")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateSlot(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSlotRequest request) {
        
        ReservationResponse res = reservationService.updateSlot(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Slot updated", res));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
