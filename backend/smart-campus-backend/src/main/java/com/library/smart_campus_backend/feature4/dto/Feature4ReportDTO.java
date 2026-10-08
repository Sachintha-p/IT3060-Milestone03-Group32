package com.library.smart_campus_backend.feature4.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class Feature4ReportDTO {
    private Long id;
    private String type;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String createdBy;
    private String summary;
    private LocalDateTime createdAt;
    private String parameters;
    private String headline;
    private Object result;
}
