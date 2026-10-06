package com.library.smart_campus_backend.feature3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAlertDTO {
    private Long id;
    private String type;
    private String message;
    private String priority;
    private String zone;
    private boolean isRead;
    private boolean resolved;
    private LocalDateTime createdAt;
}
