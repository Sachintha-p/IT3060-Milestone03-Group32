package com.library.smart_campus_backend.feature2.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature2.dto.Feature2SearchHistoryDTO;
import com.library.smart_campus_backend.feature2.service.Feature2SearchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books/search-history")
@RequiredArgsConstructor
public class Feature2SearchHistoryController {
    
    private final Feature2SearchHistoryService searchHistoryService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> addSearchHistory(
            @RequestBody java.util.Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String query = request.get("query");
        if (query != null && !query.trim().isEmpty()) {
            searchHistoryService.addSearchHistory(userDetails.getUsername(), query.trim());
        }
        return ResponseEntity.ok(ApiResponse.ok("Search history added", null));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Feature2SearchHistoryDTO>>> getSearchHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Feature2SearchHistoryDTO> history = searchHistoryService.getSearchHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Search history retrieved", history));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> clearAllHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        searchHistoryService.clearAllHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Search history cleared", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteHistoryItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        searchHistoryService.deleteHistoryItem(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("History item deleted", null));
    }
}
