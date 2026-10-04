package com.library.smart_campus_backend.feature1.dto;

import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private String code;
    private SpaceSummaryDTO space;
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime checkedInAt;
    private LocalDateTime cancelledAt;
}
