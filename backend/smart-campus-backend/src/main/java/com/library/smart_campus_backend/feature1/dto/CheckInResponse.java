package com.library.smart_campus_backend.feature1.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data
@Builder
public class CheckInResponse {
    private String message;
    private LocalTime occupiedUntil;
}
