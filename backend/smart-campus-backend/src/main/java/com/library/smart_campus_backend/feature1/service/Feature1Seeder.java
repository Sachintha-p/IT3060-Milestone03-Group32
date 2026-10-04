package com.library.smart_campus_backend.feature1.service;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.model.Reservation;
import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import com.library.smart_campus_backend.feature1.model.Space;
import com.library.smart_campus_backend.feature1.model.SpaceType;
import com.library.smart_campus_backend.feature1.model.Zone;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Order(2)
public class Feature1Seeder implements CommandLineRunner {

    private final SpaceRepository spaceRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    @Override
    public void run(String... args) throws Exception {
        if (spaceRepository.count() > 0) {
            return;
        }

        Space deskA1 = spaceRepository.save(Space.builder()
                .name("Desk A1").floorLabel("Floor 3 (Group)").zone(Zone.GROUP_STUDY)
                .type(SpaceType.DESK).capacity(1).hasPowerOutlet(true).hasDesktopPc(false).build());

        Space deskA2 = spaceRepository.save(Space.builder()
                .name("Desk A2").floorLabel("Floor 3 (Group)").zone(Zone.GROUP_STUDY)
                .type(SpaceType.DESK).capacity(1).hasPowerOutlet(true).hasDesktopPc(false).build());

        Space deskB1 = spaceRepository.save(Space.builder()
                .name("Desk B1").floorLabel("Floor 1 (Quiet)").zone(Zone.SILENT_STUDY)
                .type(SpaceType.DESK).capacity(1).hasPowerOutlet(false).hasDesktopPc(false).build());

        Space deskB2 = spaceRepository.save(Space.builder()
                .name("Desk B2").floorLabel("Floor 1 (Quiet)").zone(Zone.SILENT_STUDY)
                .type(SpaceType.DESK).capacity(1).hasPowerOutlet(false).hasDesktopPc(true).build());

        Space discRm1 = spaceRepository.save(Space.builder()
                .name("Discussion Rm 1").floorLabel("Ground Floor - Admin").zone(Zone.GROUP_STUDY)
                .type(SpaceType.ROOM).capacity(6).hasPowerOutlet(true).hasDesktopPc(true).build());
        
        System.out.println("Seeded feature1 spaces.");

        User student1 = userRepository.findByEmail("it20000000@my.sliit.lk").orElse(null);
        if (student1 == null) return;

        LocalDate today = LocalDate.now(clock);
        LocalTime currentHour = LocalTime.now(clock).truncatedTo(ChronoUnit.HOURS);
        
        // This is safe because PrePersist will set the active slot keys
        reservationRepository.save(Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(student1)
                .space(deskA2)
                .reservationDate(today)
                .startTime(currentHour)
                .endTime(currentHour.plusHours(1))
                .status(ReservationStatus.CHECKED_IN)
                .createdAt(LocalDateTime.now(clock))
                .checkedInAt(LocalDateTime.now(clock))
                .build());

        // We can't book the SAME user for the SAME time in a different space (Rule 2)
        // Wait, the seeder currently books student1 for deskA2, deskB2, and discRm1 AT THE SAME TIME!
        // This will violate the unique constraint on userActiveSlotKey!
        // We must change the times for student1's other reservations.
        
        reservationRepository.save(Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(student1)
                .space(deskB2)
                .reservationDate(today)
                .startTime(currentHour.plusHours(1)) // next hour
                .endTime(currentHour.plusHours(2))
                .status(ReservationStatus.RESERVED)
                .createdAt(LocalDateTime.now(clock))
                .build());

        // For discRm1, let's use another student if possible, or another time, or yesterday
        User student2 = userRepository.findByEmail("it21000000@my.sliit.lk").orElse(student1);
        
        reservationRepository.save(Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(student2)
                .space(discRm1)
                .reservationDate(today)
                .startTime(currentHour)
                .endTime(currentHour.plusHours(1))
                .status(ReservationStatus.RESERVED)
                .createdAt(LocalDateTime.now(clock))
                .build());
        
        // Reservation for tomorrow
        reservationRepository.save(Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(student1)
                .space(deskA2)
                .reservationDate(today.plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .status(ReservationStatus.RESERVED)
                .createdAt(LocalDateTime.now(clock))
                .build());

        System.out.println("Seeded feature1 reservations.");
    }
}
