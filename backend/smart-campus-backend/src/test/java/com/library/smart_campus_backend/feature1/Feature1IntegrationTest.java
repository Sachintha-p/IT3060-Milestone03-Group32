package com.library.smart_campus_backend.feature1;

import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.dto.ReservationRequest;
import com.library.smart_campus_backend.feature1.model.Space;
import com.library.smart_campus_backend.feature1.model.SpaceType;
import com.library.smart_campus_backend.feature1.model.Zone;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import com.library.smart_campus_backend.feature1.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
public class Feature1IntegrationTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private Long spaceId;

    @BeforeEach
    void setup() {
        reservationRepository.deleteAll();
        spaceRepository.deleteAll();
        userRepository.deleteAll();

        Space space = Space.builder()
                .name("Test Desk")
                .floorLabel("Floor 1")
                .zone(Zone.SILENT_STUDY)
                .type(SpaceType.DESK)
                .capacity(1)
                .hasPowerOutlet(true)
                .hasDesktopPc(false)
                .build();
        space = spaceRepository.save(space);
        spaceId = space.getId();

        User user1 = new User();
        user1.setEmail("u1@my.sliit.lk");
        user1.setName("User 1");
        user1.setRole(Role.STUDENT);
        user1.setPassword("test");
        userRepository.save(user1);

        User user2 = new User();
        user2.setEmail("u2@my.sliit.lk");
        user2.setName("User 2");
        user2.setRole(Role.STUDENT);
        user2.setPassword("test");
        userRepository.save(user2);
    }

    @Test
    void testRule1_DoubleBookingRaceCondition() throws InterruptedException {
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String email = (i == 0) ? "u1@my.sliit.lk" : "u2@my.sliit.lk";
            executor.submit(() -> {
                try {
                    latch.await();
                    ReservationRequest req = new ReservationRequest();
                    req.setSpaceId(spaceId);
                    req.setDate(LocalDate.now().plusDays(1)); // future date to avoid clock issues
                    req.setStartTime(LocalTime.of(10, 0));
                    req.setEndTime(LocalTime.of(11, 0));
                    
                    reservationService.createReservation(req, email);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Release threads
        latch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Exactly one should succeed, one should fail (409 Conflict)
        assertEquals(1, successCount.get());
        assertEquals(1, failCount.get());
        assertEquals(1, reservationRepository.count());
    }
}
