package com.library.smart_campus_backend.feature1.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SpaceDetailDTO {
    private SpaceSummaryDTO space;
    private List<TimeSlotDTO> slots;
}
