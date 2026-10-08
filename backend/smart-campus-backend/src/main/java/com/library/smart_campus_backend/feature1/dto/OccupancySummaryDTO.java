package com.library.smart_campus_backend.feature1.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Occupancy summary for the library spaces.
 * Provides counts of total spaces and their current status.
 */
@Data
@Builder
public class OccupancySummaryDTO {
    private long total;
    private long available;
    private long reserved;
    private long occupied;
}
