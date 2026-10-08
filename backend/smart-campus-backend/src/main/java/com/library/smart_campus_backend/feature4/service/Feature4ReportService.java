package com.library.smart_campus_backend.feature4.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.smart_campus_backend.feature4.dto.Feature4ReportDTO;
import com.library.smart_campus_backend.feature4.dto.GenerateReportRequest;
import com.library.smart_campus_backend.feature4.model.Feature4AdminSetting;
import com.library.smart_campus_backend.feature4.model.Feature4Report;
import com.library.smart_campus_backend.feature4.repository.Feature4AdminSettingRepository;
import com.library.smart_campus_backend.feature4.repository.Feature4ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Feature4ReportService {

    private final Feature4ReportRepository reportRepository;
    private final Feature4AdminSettingRepository settingRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<Feature4ReportDTO> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Feature4ReportDTO getReport(Long id) {
        Feature4Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        return mapToDTO(report);
    }

    @Transactional
    public void deleteReport(Long id) {
        Feature4Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        reportRepository.delete(report);
    }

    @Transactional
    public Feature4ReportDTO generateReport(GenerateReportRequest request, String currentUsername) {
        if (request.getDateFrom() == null || request.getDateTo() == null) {
            throw new IllegalArgumentException("Dates are required");
        }
        if (request.getDateFrom().isAfter(request.getDateTo())) {
            throw new IllegalArgumentException("From date cannot be after To date");
        }
        if (ChronoUnit.DAYS.between(request.getDateFrom(), request.getDateTo()) > 366) {
            throw new IllegalArgumentException("Date range cannot exceed 366 days");
        }
        List<String> validTypes = List.of("USAGE", "OCCUPANCY", "BOOKS", "USERS");
        if (!validTypes.contains(request.getType())) {
            throw new IllegalArgumentException("Invalid report type");
        }

        Map<String, Object> result = new HashMap<>();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", request.getType());
        metadata.put("range", request.getDateFrom() + " to " + request.getDateTo());
        metadata.put("generatedAt", LocalDateTime.now().toString());
        metadata.put("generatedBy", currentUsername);
        result.put("metadata", metadata);

        List<Map<String, Object>> metrics = new ArrayList<>();
        List<String> dataSources = new ArrayList<>();

        String summary = "Report Type: " + request.getType() + "\nGenerated: " + LocalDateTime.now();

        try {
            if ("USAGE".equals(request.getType())) {
                dataSources.add("feature1_reservations");
                dataSources.add("feature1_spaces");
                
                Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM feature1_reservations WHERE reservation_date BETWEEN ? AND ?", Long.class, request.getDateFrom(), request.getDateTo());
                if (total == null) total = 0L;
                
                metrics.add(Map.of("key", "total_reservations", "label", "Total Reservations", "value", total, "source", "feature1_reservations"));
                
                if (total > 0) {
                    List<Map<String, Object>> statuses = jdbcTemplate.queryForList("SELECT status, COUNT(*) as cnt FROM feature1_reservations WHERE reservation_date BETWEEN ? AND ? GROUP BY status", request.getDateFrom(), request.getDateTo());
                    long checkedIn = 0;
                    long cancelled = 0;
                    for (Map<String, Object> row : statuses) {
                        String s = String.valueOf(row.get("status"));
                        long c = ((Number) row.get("cnt")).longValue();
                        metrics.add(Map.of("key", "status_" + s, "label", "Status " + s, "value", c, "source", "feature1_reservations.status"));
                        if ("1".equals(s) || "CHECKED_IN".equals(s)) checkedIn = c;
                        if ("2".equals(s) || "CANCELLED".equals(s)) cancelled = c;
                    }
                    metrics.add(Map.of("key", "checkin_rate", "label", "Check-in Rate", "value", (checkedIn * 100 / total) + "%", "source", "calculated"));
                    metrics.add(Map.of("key", "cancellation_rate", "label", "Cancellation Rate", "value", (cancelled * 100 / total) + "%", "source", "calculated"));
                    
                    List<Map<String, Object>> zones = jdbcTemplate.queryForList("SELECT s.zone, COUNT(r.id) as cnt FROM feature1_reservations r JOIN feature1_spaces s ON r.space_id = s.id WHERE r.reservation_date BETWEEN ? AND ? GROUP BY s.zone ORDER BY cnt DESC", request.getDateFrom(), request.getDateTo());
                    if (!zones.isEmpty()) {
                        metrics.add(Map.of("key", "busiest_zone", "label", "Busiest Zone", "value", zones.get(0).get("zone"), "source", "feature1_spaces.zone"));
                    }
                    for (Map<String, Object> row : zones) {
                        metrics.add(Map.of("key", "zone_" + row.get("zone"), "label", "Zone " + row.get("zone"), "value", row.get("cnt"), "source", "feature1_spaces.zone"));
                    }
                    
                    List<Map<String, Object>> hours = jdbcTemplate.queryForList("SELECT start_time, COUNT(*) as cnt FROM feature1_reservations WHERE reservation_date BETWEEN ? AND ? GROUP BY start_time ORDER BY cnt DESC", request.getDateFrom(), request.getDateTo());
                    if (!hours.isEmpty()) {
                        metrics.add(Map.of("key", "peak_hour", "label", "Peak Hour", "value", hours.get(0).get("start_time"), "source", "feature1_reservations.start_time"));
                    }
                    
                    summary += "\nTotal Reservations: " + total;
                } else {
                    metrics.add(Map.of("key", "note", "label", "Note", "value", "No data in this period", "source", ""));
                }
            } else if ("OCCUPANCY".equals(request.getType())) {
                dataSources.add("feature1_spaces");
                dataSources.add("feature1_reservations");
                
                int threshold = settingRepository.findAll().stream().findFirst().map(Feature4AdminSetting::getOccupancyThreshold).orElse(90);
                metrics.add(Map.of("key", "threshold", "label", "Admin Occupancy Threshold", "value", threshold + "%", "source", "feature4_admin_settings"));
                
                metrics.add(Map.of("key", "snapshot_note", "label", "Note", "value", "This is a snapshot at generation time, not date-filtered.", "source", ""));
                
                List<Map<String, Object>> occs = jdbcTemplate.queryForList("SELECT s.zone, SUM(s.capacity) as cap FROM feature1_spaces s GROUP BY s.zone");
                for (Map<String, Object> occ : occs) {
                    String zone = String.valueOf(occ.get("zone"));
                    long cap = occ.get("cap") != null ? ((Number) occ.get("cap")).longValue() : 0;
                    
                    Long active = jdbcTemplate.queryForObject("SELECT COUNT(r.id) FROM feature1_reservations r JOIN feature1_spaces s ON r.space_id = s.id WHERE s.zone = ? AND r.reservation_date = CURRENT_DATE AND CURRENT_TIME BETWEEN r.start_time AND r.end_time AND r.status IN ('0', '1', 'RESERVED', 'CHECKED_IN')", Long.class, zone);
                    if (active == null) active = 0L;
                    
                    long pct = cap > 0 ? (active * 100 / cap) : 0;
                    metrics.add(Map.of("key", "occ_" + zone, "label", "Occupancy " + zone, "value", active + "/" + cap + " (" + pct + "%)", "source", "feature1_spaces"));
                    if (pct >= threshold) {
                        metrics.add(Map.of("key", "alert_" + zone, "label", "Alert " + zone, "value", "Above threshold!", "source", "calculated"));
                    }
                }
            } else if ("BOOKS".equals(request.getType())) {
                dataSources.add("feature3_books");
                dataSources.add("feature2_restock_alerts");
                dataSources.add("feature3_shelving_logs");
                dataSources.add("feature2_search_history");
                
                List<Map<String, Object>> booksByStatus = jdbcTemplate.queryForList("SELECT status, COUNT(*) as cnt FROM feature3_books GROUP BY status");
                for (Map<String, Object> row : booksByStatus) {
                    metrics.add(Map.of("key", "book_status_" + row.get("status"), "label", "Books " + row.get("status"), "value", row.get("cnt"), "source", "feature3_books.status"));
                }
                
                Long reminders = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM feature2_restock_alerts WHERE created_at >= ? AND created_at <= ?", Long.class, request.getDateFrom().atStartOfDay(), request.getDateTo().plusDays(1).atStartOfDay());
                if (reminders == null) reminders = 0L;
                metrics.add(Map.of("key", "total_reminders", "label", "Reminders Created", "value", reminders, "source", "feature2_restock_alerts"));
                
                List<Map<String, Object>> topSearches = jdbcTemplate.queryForList("SELECT query, COUNT(*) as cnt FROM feature2_search_history WHERE created_at >= ? AND created_at <= ? GROUP BY query ORDER BY cnt DESC LIMIT 10", request.getDateFrom().atStartOfDay(), request.getDateTo().plusDays(1).atStartOfDay());
                int rank = 1;
                for (Map<String, Object> row : topSearches) {
                    metrics.add(Map.of("key", "search_" + rank, "label", "Top Search " + rank, "value", row.get("query") + " (" + row.get("cnt") + ")", "source", "feature2_search_history.query"));
                    rank++;
                }
                
                List<Map<String, Object>> topChanged = jdbcTemplate.queryForList("SELECT book_id, COUNT(*) as cnt FROM feature3_shelving_logs WHERE created_at >= ? AND created_at <= ? GROUP BY book_id ORDER BY cnt DESC LIMIT 5", request.getDateFrom().atStartOfDay(), request.getDateTo().plusDays(1).atStartOfDay());
                rank = 1;
                for (Map<String, Object> row : topChanged) {
                    metrics.add(Map.of("key", "change_" + rank, "label", "Most Changed Book " + rank, "value", "Book ID: " + row.get("book_id") + " (" + row.get("cnt") + " changes)", "source", "feature3_shelving_logs"));
                    rank++;
                }
            } else if ("USERS".equals(request.getType())) {
                dataSources.add("users");
                List<Map<String, Object>> byRole = jdbcTemplate.queryForList("SELECT role, COUNT(*) as cnt FROM users GROUP BY role");
                for (Map<String, Object> row : byRole) {
                    metrics.add(Map.of("key", "role_" + row.get("role"), "label", "Role " + row.get("role"), "value", row.get("cnt"), "source", "users.role"));
                }
                List<Map<String, Object>> byStatus = jdbcTemplate.queryForList("SELECT status, COUNT(*) as cnt FROM users GROUP BY status");
                for (Map<String, Object> row : byStatus) {
                    metrics.add(Map.of("key", "status_" + row.get("status"), "label", "Status " + row.get("status"), "value", row.get("cnt"), "source", "users.status"));
                }
                metrics.add(Map.of("key", "new_users", "label", "New Accounts", "value", "Omitted: users table has no created timestamp", "source", "users"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            metrics.add(Map.of("key", "error", "label", "Error generating metrics", "value", e.getMessage(), "source", "system"));
        }
        
        result.put("metrics", metrics);
        result.put("dataSources", dataSources);
        
        String resultJson = "{}";
        try {
            resultJson = objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Feature4Report report = Feature4Report.builder()
                .type(request.getType())
                .dateFrom(request.getDateFrom())
                .dateTo(request.getDateTo())
                .createdBy(currentUsername)
                .summary(summary)
                .resultJson(resultJson)
                .build();
                
        return mapToDTO(reportRepository.save(report));
    }

    private Feature4ReportDTO mapToDTO(Feature4Report report) {
        Object parsedResult = null;
        try {
            if (report.getResultJson() != null) {
                parsedResult = objectMapper.readValue(report.getResultJson(), Map.class);
            }
        } catch (Exception e) {
            // ignore
        }
        return Feature4ReportDTO.builder()
                .id(report.getId())
                .type(report.getType())
                .dateFrom(report.getDateFrom())
                .dateTo(report.getDateTo())
                .createdBy(report.getCreatedBy())
                .summary(report.getSummary())
                .createdAt(report.getCreatedAt())
                .parameters(report.getParameters())
                .result(parsedResult)
                .build();
    }
}
