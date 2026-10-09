package com.library.smart_campus_backend.feature1.service;

import com.library.smart_campus_backend.feature1.dto.OccupancySummaryDTO;
import com.library.smart_campus_backend.feature1.dto.SpaceDetailDTO;
import com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO;
import com.library.smart_campus_backend.feature1.dto.TimeSlotDTO;
import com.library.smart_campus_backend.feature1.dto.ZoneSummaryDTO;
import com.library.smart_campus_backend.feature1.model.Reservation;
import com.library.smart_campus_backend.feature1.model.ReservationStatus;
import com.library.smart_campus_backend.feature1.model.Space;
import com.library.smart_campus_backend.feature1.model.Zone;
import com.library.smart_campus_backend.feature1.repository.ReservationRepository;
import com.library.smart_campus_backend.feature1.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final ReservationRepository reservationRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<SpaceSummaryDTO> getSpaces(String floorLabel, List<Zone> zones, Boolean hasPower, Boolean hasPc) {
        Specification<Space> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (floorLabel != null && !floorLabel.isEmpty()) {
                predicates.add(cb.equal(root.get("floorLabel"), floorLabel));
            }
            if (zones != null && !zones.isEmpty()) {
                predicates.add(root.get("zone").in(zones));
            }
            if (hasPower != null) {
                predicates.add(cb.equal(root.get("hasPowerOutlet"), hasPower));
            }
            if (hasPc != null) {
                predicates.add(cb.equal(root.get("hasDesktopPc"), hasPc));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Space> spaces = spaceRepository.findAll(spec);
        Map<Long, Reservation> currentReservations = getCurrentReservationsMap();

        return spaces.stream().map(space -> {
            String status = "AVAILABLE";
            Reservation res = currentReservations.get(space.getId());
            if (res != null) {
                status = res.getStatus().name();
            }
            return buildSummary(space, status);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpaceDetailDTO getSpaceDetail(Long id) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Space not found"));

        LocalDate today = LocalDate.now(clock);
        List<Reservation> activeRes = reservationRepository.findBySpaceIdAndReservationDateAndStatusIn(
                id, today, List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN));

        Set<LocalTime> bookedStartTimes = activeRes.stream()
                .map(Reservation::getStartTime)
                .collect(Collectors.toSet());

        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalTime now = LocalTime.now(clock);
        // Library hours 08:00 to 18:00
        for (int h = 8; h < 18; h++) {
            LocalTime slotStart = LocalTime.of(h, 0);
            LocalTime slotEnd = LocalTime.of(h + 1, 0);
            
            boolean isBooked = false;
            for (Reservation res : activeRes) {
                if (slotStart.isBefore(res.getEndTime()) && slotEnd.isAfter(res.getStartTime())) {
                    isBooked = true;
                    break;
                }
            }
            
            slots.add(TimeSlotDTO.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .isBooked(isBooked)
                    .build());
        }

        Map<Long, Reservation> currentReservations = getCurrentReservationsMap();
        String currentStatus = "AVAILABLE";
        if (currentReservations.containsKey(id)) {
            currentStatus = currentReservations.get(id).getStatus().name();
        }

        return SpaceDetailDTO.builder()
                .space(buildSummary(space, currentStatus))
                .slots(slots)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ZoneSummaryDTO> getZoneSummaries() {
        List<Space> spaces = spaceRepository.findAll();
        Map<Long, Reservation> currentReservations = getCurrentReservationsMap();

        // Group spaces by FloorLabel -> Zone
        Map<String, Map<Zone, List<Space>>> grouped = spaces.stream()
                .collect(Collectors.groupingBy(Space::getFloorLabel, Collectors.groupingBy(Space::getZone)));

        List<ZoneSummaryDTO> summaries = new ArrayList<>();
        
        grouped.forEach((floor, zoneMap) -> {
            zoneMap.forEach((zone, spaceList) -> {
                long total = spaceList.size();
                long available = 0;
                long reserved = 0;
                long occupied = 0;

                for (Space s : spaceList) {
                    Reservation res = currentReservations.get(s.getId());
                    if (res == null) {
                        available++;
                    } else if (res.getStatus() == ReservationStatus.RESERVED) {
                        reserved++;
                    } else if (res.getStatus() == ReservationStatus.CHECKED_IN) {
                        occupied++;
                    }
                }

                summaries.add(ZoneSummaryDTO.builder()
                        .floorLabel(floor)
                        .zone(zone)
                        .total(total)
                        .available(available)
                        .reserved(reserved)
                        .occupied(occupied)
                        .build());
            });
        });

        return summaries;
    }

    private Map<Long, Reservation> getCurrentReservationsMap() {
        LocalDate today = LocalDate.now(clock);
        LocalTime currentSlot = LocalTime.now(clock).truncatedTo(ChronoUnit.HOURS);

        // Fetch join is configured on the repository method
        List<Reservation> todayActive = reservationRepository.findByReservationDateAndStatusIn(
                today, List.of(ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN));

        Map<Long, Reservation> map = new HashMap<>();
        for (Reservation r : todayActive) {
            if (!currentSlot.isBefore(r.getStartTime()) && (r.getEndTime().equals(LocalTime.MIDNIGHT) || currentSlot.isBefore(r.getEndTime()))) {
                map.put(r.getSpace().getId(), r);
            }
        }
        return map;
    }

    @Transactional(readOnly = true)
    public OccupancySummaryDTO getOccupancySummary() {
        List<Space> allSpaces = spaceRepository.findAll();
        Map<Long, Reservation> current = getCurrentReservationsMap();
        long total = allSpaces.size();
        long available = 0;
        long reserved = 0;
        long occupied = 0;
        for (Space s : allSpaces) {
            Reservation r = current.get(s.getId());
            if (r == null) {
                available++;
            } else if (r.getStatus() == ReservationStatus.RESERVED) {
                reserved++;
            } else if (r.getStatus() == ReservationStatus.CHECKED_IN) {
                occupied++;
            }
        }
        return OccupancySummaryDTO.builder()
                .total(total)
                .available(available)
                .reserved(reserved)
                .occupied(occupied)
                .build();
    }

    private SpaceSummaryDTO buildSummary(Space space, String status) {
        List<String> amenities = new ArrayList<>();
        if (Boolean.TRUE.equals(space.getHasPowerOutlet())) amenities.add("Power Outlet");
        if (Boolean.TRUE.equals(space.getHasDesktopPc())) amenities.add("Desktop PC");

        return SpaceSummaryDTO.builder()
                .id(space.getId())
                .name(space.getName())
                .floorLabel(space.getFloorLabel())
                .zone(space.getZone())
                .type(space.getType())
                .capacity(space.getCapacity())
                .hasPowerOutlet(space.getHasPowerOutlet())
                .hasDesktopPc(space.getHasDesktopPc())
                .amenities(amenities)
                .status(status)
                .build();
    }
}
