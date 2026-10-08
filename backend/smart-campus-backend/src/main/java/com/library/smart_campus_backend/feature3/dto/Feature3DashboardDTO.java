package com.library.smart_campus_backend.feature3.dto;

import com.library.smart_campus_backend.feature1.dto.ZoneSummaryDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class Feature3DashboardDTO {
    private List<ZoneSummaryDTO> zones;
    private long unresolvedAlerts;
}
