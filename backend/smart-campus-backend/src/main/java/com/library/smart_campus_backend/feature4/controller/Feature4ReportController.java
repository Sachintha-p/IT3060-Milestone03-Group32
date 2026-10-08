package com.library.smart_campus_backend.feature4.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature4.dto.Feature4ReportDTO;
import com.library.smart_campus_backend.feature4.dto.GenerateReportRequest;
import com.library.smart_campus_backend.feature4.service.Feature4ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feature4/reports")
@RequiredArgsConstructor
public class Feature4ReportController {

    private final Feature4ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Feature4ReportDTO>>> getReports() {
        return ResponseEntity.ok(ApiResponse.ok("Reports retrieved", reportService.getAllReports()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Feature4ReportDTO>> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Report retrieved", reportService.getReport(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Feature4ReportDTO>> generateReport(
            @RequestBody GenerateReportRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Report generated", reportService.generateReport(request, auth.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.ok("Report deleted", null));
    }
}
