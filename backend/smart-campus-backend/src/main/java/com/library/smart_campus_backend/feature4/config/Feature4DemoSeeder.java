package com.library.smart_campus_backend.feature4.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Component
public class Feature4DemoSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public Feature4DemoSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if demo history is already seeded
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM feature1_reservations WHERE code LIKE 'DEMO-%'", Integer.class);

        if (count != null && count > 0) {
            System.out.println("Feature 4 Demo Seeder: Demo history already exists.");
            printStats();
            return;
        }

        Integer settingsCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM feature4_admin_settings", Integer.class);
        if (settingsCount == null || settingsCount == 0) {
            System.out.println("Feature 4 Demo Seeder: Seeding admin settings...");
            jdbcTemplate.update("INSERT INTO feature4_admin_settings (occupancy_threshold, auto_generate_weekly_report, allow_guest_lookups) VALUES (?, ?, ?)",
                    80, true, true);
        }
        
        Integer adminCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = 'admin@library.edu'", Integer.class);
        if (adminCount == null || adminCount == 0) {
            jdbcTemplate.update("INSERT INTO users (name, email, student_id, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
                "Test Admin", "admin@library.edu", "ADMIN001", "$2a$10$wYpE8q6aG4l1Y/1U6P2y.O.4B/bKqGvD2N4lQ9QzWkUqX2YvV3eH6", "ADMIN", "ACTIVE"); // password123
        }
        
        Integer studentCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email = 'student@library.edu'", Integer.class);
        if (studentCount == null || studentCount == 0) {
            jdbcTemplate.update("INSERT INTO users (name, email, student_id, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
                "Test Student", "student@library.edu", "STU12345", "$2a$10$wYpE8q6aG4l1Y/1U6P2y.O.4B/bKqGvD2N4lQ9QzWkUqX2YvV3eH6", "STUDENT", "ACTIVE");
        }

        System.out.println("Feature 4 Demo Seeder: Seeding demo history...");

        // Get some users (students)
        List<Long> studentIds = jdbcTemplate.queryForList(
                "SELECT id FROM users WHERE role = 'STUDENT'", Long.class);
        if (studentIds.isEmpty()) return;

        // Get some spaces
        List<Long> spaceIds = jdbcTemplate.queryForList(
                "SELECT id FROM feature1_spaces", Long.class);
        if (spaceIds.isEmpty()) return;

        // Check data type of status
        String statusType = jdbcTemplate.queryForObject(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'feature1_reservations' AND column_name = 'status'", String.class);
        boolean statusIsString = statusType != null && statusType.contains("character");

        Random random = new Random(42); // fixed seed for reproducibility
        LocalDate today = LocalDate.now();

        java.util.Set<String> usedSlotKeys = new java.util.HashSet<>();
        java.util.Set<String> usedUserSlotKeys = new java.util.HashSet<>();

        // These rows are demo history
        int inserted = 0;
        int attempts = 0;
        while (inserted < 40 && attempts < 200) {
            attempts++;
            Long userId = studentIds.get(random.nextInt(studentIds.size()));
            Long spaceId = spaceIds.get(random.nextInt(spaceIds.size()));
            
            // Random date in the last 30 days
            LocalDate resDate = today.minusDays(random.nextInt(30) + 1);
            // Random start time between 8 and 18
            LocalTime startTime = LocalTime.of(8 + random.nextInt(11), 0);
            LocalTime endTime = startTime.plusHours(1);

            String activeSlotKey = spaceId + "_" + resDate + "_" + startTime;
            String userActiveSlotKey = userId + "_" + resDate + "_" + startTime;

            String code = "DEMO-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            
            // Status mix: ~70% CHECKED_IN, ~20% CANCELLED, ~10% RESERVED
            int randStatus = random.nextInt(100);
            String statusStr;
            LocalDateTime createdAt = LocalDateTime.of(resDate, startTime).minusDays(random.nextInt(3)).minusHours(random.nextInt(24));
            LocalDateTime checkedInAt = null;
            LocalDateTime cancelledAt = null;

            if (randStatus < 70) {
                statusStr = "CHECKED_IN";
                checkedInAt = LocalDateTime.of(resDate, startTime).plusMinutes(random.nextInt(15));
            } else if (randStatus < 90) {
                statusStr = "CANCELLED";
                cancelledAt = LocalDateTime.of(resDate, startTime).minusHours(random.nextInt(24));
                activeSlotKey = null;
                userActiveSlotKey = null;
            } else {
                statusStr = "RESERVED";
            }

            if (activeSlotKey != null && usedSlotKeys.contains(activeSlotKey)) continue;
            if (userActiveSlotKey != null && usedUserSlotKeys.contains(userActiveSlotKey)) continue;

            Object statusVal = statusIsString ? statusStr : ("RESERVED".equals(statusStr) ? 0 : ("CHECKED_IN".equals(statusStr) ? 1 : 2));

            try {
                jdbcTemplate.update(
                        "INSERT INTO feature1_reservations (code, user_id, space_id, reservation_date, start_time, end_time, status, created_at, checked_in_at, cancelled_at, active_slot_key, user_active_slot_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        code, userId, spaceId, resDate, startTime, endTime, statusVal, createdAt, checkedInAt, cancelledAt, activeSlotKey, userActiveSlotKey
                );
                if (activeSlotKey != null) usedSlotKeys.add(activeSlotKey);
                if (userActiveSlotKey != null) usedUserSlotKeys.add(userActiveSlotKey);
                inserted++;
            } catch (Exception e) {
                // Ignore unique constraint violations from DB
            }
        }
        
        System.out.println("Feature 4 Demo Seeder: Completed seeding " + inserted + " rows.");
        printStats();
    }

    private void printStats() {
        System.out.println("--- Demo History Stats ---");
        List<Map<String, Object>> statusCounts = jdbcTemplate.queryForList(
                "SELECT status, COUNT(*) as count FROM feature1_reservations GROUP BY status");
        System.out.println("Counts by Status (Ordinal: 0=RESERVED, 1=CHECKED_IN, 2=CANCELLED):");
        statusCounts.forEach(row -> System.out.println("  " + row.get("status") + ": " + row.get("count")));

        List<Map<String, Object>> zoneCounts = jdbcTemplate.queryForList(
                "SELECT s.zone, COUNT(r.id) as count FROM feature1_reservations r JOIN feature1_spaces s ON r.space_id = s.id GROUP BY s.zone");
        System.out.println("Counts by Zone:");
        zoneCounts.forEach(row -> System.out.println("  " + row.get("zone") + ": " + row.get("count")));
    }
}
