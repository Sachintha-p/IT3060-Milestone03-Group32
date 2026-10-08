package com.library.smart_campus_backend.feature4.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature4.dto.Feature4AdminSettingDTO;
import com.library.smart_campus_backend.feature4.service.Feature4AdminSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feature4/settings")
@RequiredArgsConstructor
public class Feature4AdminSettingController {

    private final Feature4AdminSettingService settingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Feature4AdminSettingDTO>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok("Admin settings retrieved", settingService.getSettings()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Feature4AdminSettingDTO>> updateSettings(@RequestBody Feature4AdminSettingDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Admin settings updated", settingService.updateSettings(req)));
    }
}
