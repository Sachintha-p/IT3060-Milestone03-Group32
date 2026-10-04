package com.library.smart_campus_backend.feature1.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature1.dto.CheckInResponse;
import com.library.smart_campus_backend.feature1.dto.ReservationRequest;
import com.library.smart_campus_backend.feature1.dto.ReservationResponse;
import com.library.smart_campus_backend.feature1.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        ReservationResponse res = reservationService.createReservation(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Reservation created successfully", res));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<ReservationResponse> res = reservationService.getMyReservations(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Reservations retrieved successfully", res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        ReservationResponse res = reservationService.getReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Reservation retrieved successfully", res));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        CheckInResponse res = reservationService.checkIn(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Checked in successfully", res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        reservationService.cancelReservation(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled successfully", null));
    }
}
