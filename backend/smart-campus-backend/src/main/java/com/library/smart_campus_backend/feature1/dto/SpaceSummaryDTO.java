package com.library.smart_campus_backend.feature1.dto;

import com.library.smart_campus_backend.feature1.model.SpaceType;
import com.library.smart_campus_backend.feature1.model.Zone;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceSummaryDTO {
    private Long id;
    private String name;
    private String floorLabel;
    private Zone zone;
    private SpaceType type;
    private Integer capacity;
    private Boolean hasPowerOutlet;
    private Boolean hasDesktopPc;
    private java.util.List<String> amenities;
    private String status;
}
