package com.library.smart_campus_backend.feature2.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Feature2SearchHistoryDTO {
    private Long id;
    private String query;
    private LocalDateTime createdAt;
}
