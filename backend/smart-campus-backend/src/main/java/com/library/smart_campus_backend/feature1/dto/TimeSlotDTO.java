package com.library.smart_campus_backend.feature1.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data
@Builder
public class TimeSlotDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isBooked;
}
