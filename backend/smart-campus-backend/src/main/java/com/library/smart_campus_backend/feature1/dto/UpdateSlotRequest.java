package com.library.smart_campus_backend.feature1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSlotRequest {
    @NotNull
    private LocalDate reservationDate;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
}
