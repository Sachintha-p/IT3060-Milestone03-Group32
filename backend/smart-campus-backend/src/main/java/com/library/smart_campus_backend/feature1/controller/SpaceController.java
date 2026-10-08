package com.library.smart_campus_backend.feature1.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature1.dto.OccupancySummaryDTO;
import com.library.smart_campus_backend.feature1.dto.SpaceDetailDTO;
import com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO;
import com.library.smart_campus_backend.feature1.dto.ZoneSummaryDTO;
import com.library.smart_campus_backend.feature1.model.Zone;
import com.library.smart_campus_backend.feature1.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @GetMapping("/spaces")
    public ResponseEntity<ApiResponse<List<SpaceSummaryDTO>>> getSpaces(
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) List<Zone> zone,
            @RequestParam(required = false) Boolean hasPower,
            @RequestParam(required = false) Boolean hasPc) {
        
        List<SpaceSummaryDTO> spaces = spaceService.getSpaces(floor, zone, hasPower, hasPc);
        return ResponseEntity.ok(ApiResponse.ok("Spaces retrieved successfully", spaces));
    }

    @GetMapping("/spaces/{id}")
    public ResponseEntity<ApiResponse<SpaceDetailDTO>> getSpaceDetail(@PathVariable Long id) {
        SpaceDetailDTO detail = spaceService.getSpaceDetail(id);
        return ResponseEntity.ok(ApiResponse.ok("Space details retrieved successfully", detail));
    }

    @GetMapping("/zones/summary")
    public ResponseEntity<ApiResponse<List<ZoneSummaryDTO>>> getZoneSummaries() {
        List<ZoneSummaryDTO> summaries = spaceService.getZoneSummaries();
        return ResponseEntity.ok(ApiResponse.ok("Zone summaries retrieved successfully", summaries));
    }

    @GetMapping("/spaces/occupancy-summary")
    public ResponseEntity<ApiResponse<OccupancySummaryDTO>> getOccupancySummary() {
        OccupancySummaryDTO summary = spaceService.getOccupancySummary();
        return ResponseEntity.ok(ApiResponse.ok("Occupancy summary retrieved successfully", summary));
    }
}
