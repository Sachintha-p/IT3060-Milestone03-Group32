package com.library.smart_campus_backend.feature1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneAlertDTO {
    private Long id;
    private String zone;
    private Boolean active;
    private LocalDateTime createdAt;
}
