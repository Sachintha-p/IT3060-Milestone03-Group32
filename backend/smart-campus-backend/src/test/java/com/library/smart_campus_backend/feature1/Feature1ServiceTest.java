package com.library.smart_campus_backend.feature1;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.dto.ReservationRequest;
import com.library.smart_campus_backend.feature1.model.Reservation;
import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import com.library.smart_campus_backend.feature1.model.Space;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import com.library.smart_campus_backend.feature1.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class Feature1ServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private SpaceRepository spaceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private Clock clock;

    @InjectMocks
    private ReservationService reservationService;

    private User testUser;
    private Space testSpace;
    private final LocalDate today = LocalDate.of(2026, 10, 2);
    private final LocalTime nowTime = LocalTime.of(10, 0);

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@my.sliit.lk");

        testSpace = new Space();
        testSpace.setId(1L);
        testSpace.setHasPowerOutlet(true);
        testSpace.setHasDesktopPc(true);
        testSpace.setName("Test");
        testSpace.setFloorLabel("Floor");
    }

    private void mockClock(LocalDate date, LocalTime time) {
        Instant instant = date.atTime(time).atZone(ZoneId.systemDefault()).toInstant();
        when(clock.instant()).thenReturn(instant);
        when(clock.getZone()).thenReturn(ZoneId.systemDefault());
    }

    @Test
    void testRule2_UserCannotHoldTwoActiveReservations() {
        mockClock(today, nowTime);
        when(spaceRepository.findById(1L)).thenReturn(Optional.of(testSpace));
        when(userRepository.findByEmail("test@my.sliit.lk")).thenReturn(Optional.of(testUser));
        
        when(reservationRepository.saveAndFlush(any()))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Constraint violation"));

        ReservationRequest request = new ReservationRequest();
        request.setSpaceId(1L);
        request.setDate(today);
        request.setStartTime(LocalTime.of(11, 0));
        request.setEndTime(LocalTime.of(12, 0));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.createReservation(request, "test@my.sliit.lk"));
        assertEquals(409, e.getStatusCode().value());
    }

    @Test
    void testRule3_PastSlotsNotAllowed() {
        mockClock(today, LocalTime.of(12, 0));
        
        ReservationRequest request = new ReservationRequest();
        request.setSpaceId(1L);
        request.setDate(today);
        request.setStartTime(LocalTime.of(11, 0)); // past
        request.setEndTime(LocalTime.of(12, 0));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.createReservation(request, "test@my.sliit.lk"));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void testRule4_StartTimeMustBeOnTheHour() {
        mockClock(today, LocalTime.of(9, 0));
        
        ReservationRequest request = new ReservationRequest();
        request.setSpaceId(1L);
        request.setDate(today);
        request.setStartTime(LocalTime.of(11, 30)); // not on the hour
        request.setEndTime(LocalTime.of(12, 30));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.createReservation(request, "test@my.sliit.lk"));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void testRule5_CheckInWindow() {
        mockClock(today, LocalTime.of(10, 40)); // 20 mins before, too early
        
        Reservation res = new Reservation();
        res.setUser(testUser);
        res.setStatus(ReservationStatus.RESERVED);
        res.setReservationDate(today);
        res.setStartTime(LocalTime.of(11, 0));
        res.setEndTime(LocalTime.of(12, 0));

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(res));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.checkIn(1L, "test@my.sliit.lk"));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void testRule6_CancelOnlyReserved() {
        Reservation res = new Reservation();
        res.setUser(testUser);
        res.setStatus(ReservationStatus.CHECKED_IN); // Not RESERVED

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(res));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.cancelReservation(1L, "test@my.sliit.lk"));
        assertEquals(400, e.getStatusCode().value());
    }

    @Test
    void testRule7_SomeoneElsesReservation() {
        User otherUser = new User();
        otherUser.setEmail("other@my.sliit.lk");
        
        Reservation res = new Reservation();
        res.setUser(otherUser); // Someone else

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(res));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, 
                () -> reservationService.getReservation(1L, "test@my.sliit.lk"));
        assertEquals(404, e.getStatusCode().value());
    }
}
