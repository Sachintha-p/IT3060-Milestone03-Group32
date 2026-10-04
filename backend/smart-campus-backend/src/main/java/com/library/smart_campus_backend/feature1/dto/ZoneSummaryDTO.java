package com.library.smart_campus_backend.feature1.dto;

import com.library.smart_campus_backend.feature1.model.Zone;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ZoneSummaryDTO {
    private String floorLabel;
    private Zone zone;
    private long total;
    private long available;
    private long reserved;
    private long occupied;
}
