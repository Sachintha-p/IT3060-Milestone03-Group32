package com.library.smart_campus_backend.feature4.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class GenerateReportRequest {
    private String type;
    private LocalDate dateFrom;
    private LocalDate dateTo;
}
