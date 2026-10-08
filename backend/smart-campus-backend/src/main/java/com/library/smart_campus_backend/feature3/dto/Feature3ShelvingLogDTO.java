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
public class Feature3ShelvingLogDTO {
    private Long id;
    private Long bookId;
    private Long staffId;
    private String staffName;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime createdAt;
}
