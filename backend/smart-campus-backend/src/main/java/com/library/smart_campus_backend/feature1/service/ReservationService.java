package com.library.smart_campus_backend.feature1.service;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature1.dto.CheckInResponse;
import com.library.smart_campus_backend.feature1.dto.ReservationRequest;
import com.library.smart_campus_backend.feature1.dto.ReservationResponse;
import com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO;
import com.library.smart_campus_backend.feature1.model.Reservation;
import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import com.library.smart_campus_backend.feature1.model.Space;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final SpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    private static final LocalTime OPENING_TIME = LocalTime.of(8, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, String userEmail) {
        LocalDate today = LocalDate.now(clock);
        
        if (request.getDate().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book past dates");
        }
        
        if (request.getStartTime().getMinute() != 0 || request.getStartTime().getSecond() != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be exactly on the hour");
        }
        if (request.getStartTime().isBefore(OPENING_TIME) || request.getEndTime().isAfter(CLOSING_TIME)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot is outside library hours");
        }

        if (request.getDate().equals(today)) {
            LocalTime now = LocalTime.now(clock);
            if (request.getStartTime().isBefore(now)) {
                // Disabled for testing so we can book today's slots at night
                // throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book past time slots");
            }
        }

        Space space = spaceRepository.findById(request.getSpaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Space not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if space is already booked
        boolean spaceBooked = reservationRepository.existsBySpaceIdAndReservationDateAndStartTimeAndStatusIn(
                space.getId(), request.getDate(), request.getStartTime(), 
                List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN));
        
        if (spaceBooked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already booked for this space");
        }

        // Check if user already has a booking at the same time
        boolean userBusy = reservationRepository.existsByUserIdAndReservationDateAndStartTimeAndStatusIn(
                user.getId(), request.getDate(), request.getStartTime(),
                List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN));
        
        if (userBusy) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a reservation at this time");
        }

        Reservation res = Reservation.builder()
                .code(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .space(space)
                .reservationDate(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ReservationStatus.RESERVED)
                .createdAt(LocalDateTime.now(clock))
                .build();

        try {
            res = reservationRepository.saveAndFlush(res);
            return mapToResponse(res);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Double booking detected. The space or time is no longer available.");
        }
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<Reservation> list = reservationRepository.findByUserIdAndStatusInOrderByReservationDateAscStartTimeAsc(
                user.getId(), List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN));
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservation(Long id, String userEmail) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!res.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not your reservation"); // rule 7
        }

        return mapToResponse(res);
    }

    @Transactional
    public CheckInResponse checkIn(Long id, String userEmail) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!res.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not your reservation");
        }

        if (res.getStatus() != ReservationStatus.RESERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation is not in RESERVED state");
        }

        LocalDate today = LocalDate.now(clock);
        if (!res.getReservationDate().equals(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only check in on the day of the reservation");
        }

        LocalTime now = LocalTime.now(clock);
        LocalTime windowStart = res.getStartTime().minusMinutes(15);
        
        if (now.isBefore(windowStart) || now.isAfter(res.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in is only allowed from 15 minutes before the start time until the end time");
        }

        res.setStatus(ReservationStatus.CHECKED_IN);
        res.setCheckedInAt(LocalDateTime.now(clock));
        reservationRepository.save(res);

        return CheckInResponse.builder()
                .message("Checked in successfully")
                .occupiedUntil(res.getEndTime())
                .build();
    }

    @Transactional
    public void cancelReservation(Long id, String userEmail) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!res.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not your reservation");
        }

        if (res.getStatus() != ReservationStatus.RESERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only RESERVED slots can be cancelled");
        }

        res.setStatus(ReservationStatus.CANCELLED);
        res.setCancelledAt(LocalDateTime.now(clock));
        reservationRepository.save(res);
    }

    @Transactional
    public ReservationResponse updateSlot(Long id, String userEmail, com.library.smart_campus_backend.feature1.dto.UpdateSlotRequest request) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!res.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not your reservation");
        }

        if (res.getStatus() != ReservationStatus.RESERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only RESERVED slots can be updated");
        }

        LocalDate today = LocalDate.now(clock);
        if (request.getReservationDate().isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book past dates");
        }
        if (request.getStartTime().getMinute() != 0 || request.getStartTime().getSecond() != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be exactly on the hour");
        }
        if (request.getStartTime().isBefore(OPENING_TIME) || request.getEndTime().isAfter(CLOSING_TIME)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot is outside library hours");
        }

        // Check conflicts excluding this reservation
        boolean spaceBooked = reservationRepository.existsBySpaceIdAndReservationDateAndStartTimeAndStatusInAndIdNot(
                res.getSpace().getId(), request.getReservationDate(), request.getStartTime(),
                List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN), res.getId());
        
        if (spaceBooked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already booked for this space");
        }

        boolean userBusy = reservationRepository.existsByUserIdAndReservationDateAndStartTimeAndStatusInAndIdNot(
                res.getUser().getId(), request.getReservationDate(), request.getStartTime(),
                List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN), res.getId());
        
        if (userBusy) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a reservation at this time");
        }

        res.setReservationDate(request.getReservationDate());
        res.setStartTime(request.getStartTime());
        res.setEndTime(request.getEndTime());
        // updateActiveSlotKeys is handled by @PreUpdate in the entity
        
        try {
            res = reservationRepository.saveAndFlush(res);
            return mapToResponse(res);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Double booking detected. The space or time is no longer available.");
        }
    }

    private ReservationResponse mapToResponse(Reservation res) {
        List<String> amenities = new ArrayList<>();
        if (Boolean.TRUE.equals(res.getSpace().getHasPowerOutlet())) amenities.add("Power Outlet");
        if (Boolean.TRUE.equals(res.getSpace().getHasDesktopPc())) amenities.add("Desktop PC");

        SpaceSummaryDTO spaceDto = SpaceSummaryDTO.builder()
                .id(res.getSpace().getId())
                .name(res.getSpace().getName())
                .floorLabel(res.getSpace().getFloorLabel())
                .zone(res.getSpace().getZone())
                .type(res.getSpace().getType())
                .capacity(res.getSpace().getCapacity())
                .hasPowerOutlet(res.getSpace().getHasPowerOutlet())
                .hasDesktopPc(res.getSpace().getHasDesktopPc())
                .amenities(amenities)
                .status(res.getStatus().name())
                .build();

        return ReservationResponse.builder()
                .id(res.getId())
                .code(res.getCode())
                .space(spaceDto)
                .reservationDate(res.getReservationDate())
                .startTime(res.getStartTime())
                .endTime(res.getEndTime())
                .status(res.getStatus())
                .createdAt(res.getCreatedAt())
                .checkedInAt(res.getCheckedInAt())
                .cancelledAt(res.getCancelledAt())
                .build();
    }
}
