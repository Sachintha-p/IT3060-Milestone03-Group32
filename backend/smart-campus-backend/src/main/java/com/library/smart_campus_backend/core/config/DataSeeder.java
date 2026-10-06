package com.library.smart_campus_backend.core.config;

import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.model.*;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
// @Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.library.smart_campus_backend.feature3.repository.StaffAlertRepository staffAlertRepository;
    private final com.library.smart_campus_backend.feature3.repository.Feature3BookRepository bookRepository;
    private final com.library.smart_campus_backend.feature3.repository.Feature3StaffSettingRepository settingRepository;
    private final com.library.smart_campus_backend.feature4.repository.Feature4AdminSettingRepository adminSettingRepository;

    public DataSeeder(UserRepository userRepository, SpaceRepository spaceRepository, ReservationRepository reservationRepository, PasswordEncoder passwordEncoder, com.library.smart_campus_backend.feature3.repository.StaffAlertRepository staffAlertRepository, com.library.smart_campus_backend.feature3.repository.Feature3BookRepository bookRepository, com.library.smart_campus_backend.feature3.repository.Feature3StaffSettingRepository settingRepository, com.library.smart_campus_backend.feature4.repository.Feature4AdminSettingRepository adminSettingRepository) {
        this.userRepository = userRepository;
        this.spaceRepository = spaceRepository;
        this.reservationRepository = reservationRepository;
        this.passwordEncoder = passwordEncoder;
        this.staffAlertRepository = staffAlertRepository;
        this.bookRepository = bookRepository;
        this.settingRepository = settingRepository;
        this.adminSettingRepository = adminSettingRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Seeding database with test data...");

        // 1. Create Users
        User student = User.builder()
                .name("Test Student")
                .email("student@library.edu")
                .studentId("STU12345")
                .password(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .build();
        
        User staff = User.builder()
                .name("Test Staff")
                .email("staff@library.edu")
                .studentId("STAFF001")
                .password(passwordEncoder.encode("password123"))
                .role(Role.STAFF)
                .build();

        User admin = User.builder()
                .name("Test Admin")
                .email("admin@library.edu")
                .studentId("ADMIN001")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .build();

        if (!userRepository.existsByEmail(student.getEmail())) {
            userRepository.save(student);
        } else {
            User existing = userRepository.findByEmail(student.getEmail()).get();
            existing.setRole(Role.STUDENT);
            userRepository.save(existing);
        }
        
        if (!userRepository.existsByEmail(staff.getEmail())) {
            userRepository.save(staff);
        } else {
            User existing = userRepository.findByEmail(staff.getEmail()).get();
            existing.setRole(Role.STAFF);
            userRepository.save(existing);
        }
        
        if (!userRepository.existsByEmail(admin.getEmail())) {
            userRepository.save(admin);
        } else {
            User existing = userRepository.findByEmail(admin.getEmail()).get();
            existing.setRole(Role.ADMIN);
            userRepository.save(existing);
        }

        // Seed Admin Settings
        if (adminSettingRepository.count() == 0) {
            adminSettingRepository.save(com.library.smart_campus_backend.feature4.model.Feature4AdminSetting.builder()
                .occupancyThreshold(90)
                .autoGenerateWeeklyReport(true)
                .allowGuestLookups(true)
                .build());
        }

        if (spaceRepository.count() > 0) {
            System.out.println("Spaces already seeded. Skipping the rest.");
            return;
        }

        // 2. Create Spaces
        Space deskA1 = Space.builder()
                .name("Desk A1")
                .floorLabel("Floor 3 (Group)")
                .zone(Zone.GROUP_STUDY)
                .type(SpaceType.DESK)
                .capacity(1)
                .hasPowerOutlet(true)
                .hasDesktopPc(false)
                .build();

        Space deskA2 = Space.builder()
                .name("Desk A2")
                .floorLabel("Floor 3 (Group)")
                .zone(Zone.GROUP_STUDY)
                .type(SpaceType.DESK)
                .capacity(1)
                .hasPowerOutlet(true)
                .hasDesktopPc(true)
                .build();

        Space deskB1 = Space.builder()
                .name("Desk B1")
                .floorLabel("Floor 1 (Quiet)")
                .zone(Zone.SILENT_STUDY)
                .type(SpaceType.DESK)
                .capacity(1)
                .hasPowerOutlet(false)
                .hasDesktopPc(false)
                .build();

        Space discRm = Space.builder()
                .name("Discussion Rm 1")
                .floorLabel("Floor 1 (Quiet)")
                .zone(Zone.GROUP_STUDY)
                .type(SpaceType.ROOM)
                .capacity(6)
                .hasPowerOutlet(true)
                .hasDesktopPc(false)
                .build();

        spaceRepository.save(deskA1);
        spaceRepository.save(deskA2);
        spaceRepository.save(deskB1);
        spaceRepository.save(discRm);

        // 3. Create Reservations
        LocalDate today = LocalDate.now();
        LocalTime currentSlot = LocalTime.now().truncatedTo(ChronoUnit.HOURS);
        LocalTime nextSlot = currentSlot.plusHours(1);

        // Reservation 1: RESERVED (Yellow) on Desk A1
        Reservation res1 = Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(student)
                .space(deskA1)
                .reservationDate(today)
                .startTime(currentSlot)
                .endTime(nextSlot)
                .status(ReservationStatus.RESERVED)
                .createdAt(LocalDateTime.now())
                .build();

        // Reservation 2: CHECKED_IN (Occupied / Red) on Desk A2
        Reservation res2 = Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(staff)
                .space(deskA2)
                .reservationDate(today)
                .startTime(currentSlot)
                .endTime(nextSlot)
                .status(ReservationStatus.CHECKED_IN)
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .checkedInAt(LocalDateTime.now().minusMinutes(5))
                .build();

        reservationRepository.save(res1);
        reservationRepository.save(res2);

        // 4. Create Staff Alerts
        var staffAlert1 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("SEATING").message("Floor 1 Quiet Zone reached 95% capacity").priority("HIGH").zone("SILENT_STUDY").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusMinutes(5)).build();
        var staffAlert2 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("BOOK").message("Book 'Interaction Design' marked as missing").priority("MEDIUM").zone(null).isRead(false).resolved(false).createdAt(LocalDateTime.now().minusHours(1)).build();
        var staffAlert3 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("SEATING").message("Floor 2 Silent Pods reached 100% capacity").priority("HIGH").zone("SILENT_STUDY").isRead(true).resolved(false).createdAt(LocalDateTime.now().minusHours(2)).build();
        var staffAlert4 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("BOOK").message("Book 'The Design of Everyday Things' marked as missing").priority("MEDIUM").zone(null).isRead(true).resolved(true).createdAt(LocalDateTime.now().minusDays(1)).build();
        var staffAlert5 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("SEATING").message("Floor 3 Group Zone reached 90% capacity").priority("LOW").zone("GROUP_STUDY").isRead(false).resolved(false).createdAt(LocalDateTime.now().minusDays(2)).build();
        var staffAlert6 = com.library.smart_campus_backend.feature3.model.StaffAlert.builder()
                .type("BOOK").message("User reported misplaced book 'Clean Code'").priority("MEDIUM").zone(null).isRead(true).resolved(true).createdAt(LocalDateTime.now().minusDays(5)).build();
                
        staffAlertRepository.save(staffAlert1);
        staffAlertRepository.save(staffAlert2);
        staffAlertRepository.save(staffAlert3);
        staffAlertRepository.save(staffAlert4);
        staffAlertRepository.save(staffAlert5);
        staffAlertRepository.save(staffAlert6);

        // Seed 15 Feature3Books
        String[] titles = {"The Design of Everyday Things", "Don't Make Me Think", "Clean Code", "Design Systems", 
                           "Refactoring", "Domain-Driven Design", "Pragmatic Programmer", "Code Complete", 
                           "Introduction to Algorithms", "Design Patterns", "Clean Architecture", "Head First Java",
                           "Effective Java", "Java Concurrency in Practice", "Spring in Action"};
        String[] statuses = {"AVAILABLE", "CHECKED_OUT", "MISSING"};
        
        for (int i = 0; i < titles.length; i++) {
            bookRepository.save(com.library.smart_campus_backend.feature3.model.Feature3Book.builder()
                .title(titles[i])
                .author("Author " + (i + 1))
                .isbn("978-3-16-148410-" + i)
                .shelf("Shelf " + (i % 5 + 1))
                .section("Section " + (i % 3 + 1))
                .status(statuses[i % statuses.length])
                .build());
        }

        // Seed Staff Settings
        if (settingRepository.count() == 0) {
            settingRepository.save(com.library.smart_campus_backend.feature3.model.Feature3StaffSetting.builder()
                .userId(staff.getId())
                .pushAlerts(true)
                .emailDigest(false)
                .build());
        }

        System.out.println("Database seeding completed successfully!");
    }
}
