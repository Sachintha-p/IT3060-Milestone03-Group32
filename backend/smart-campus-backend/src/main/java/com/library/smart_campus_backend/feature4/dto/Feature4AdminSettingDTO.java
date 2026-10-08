package com.library.smart_campus_backend.feature4.dto;

import lombok.Builder;
import lombok.Data;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature4AdminSettingDTO {
    private Long id;
    private Integer occupancyThreshold;
    private Boolean autoGenerateWeeklyReport;
    private Boolean allowGuestLookups;
}
