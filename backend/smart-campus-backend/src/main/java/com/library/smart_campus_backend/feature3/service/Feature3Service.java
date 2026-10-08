package com.library.smart_campus_backend.feature3.service;

import com.library.smart_campus_backend.feature3.dto.StaffAlertDTO;
import com.library.smart_campus_backend.feature3.model.StaffAlert;
import com.library.smart_campus_backend.feature3.repository.StaffAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Feature3Service {

    private final StaffAlertRepository alertRepository;
    private final com.library.smart_campus_backend.feature3.repository.Feature3BookRepository bookRepository;
    private final com.library.smart_campus_backend.feature3.repository.Feature3ShelvingLogRepository shelvingLogRepository;
    private final com.library.smart_campus_backend.feature3.repository.Feature3StaffSettingRepository settingRepository;
    private final com.library.smart_campus_backend.feature1.repository.SpaceRepository spaceRepository;
    private final com.library.smart_campus_backend.auth.repository.UserRepository userRepository;
    private final com.library.smart_campus_backend.feature1.repository.ReservationRepository reservationRepository;
    private final com.library.smart_campus_backend.feature1.repository.ZoneAlertRepository zoneAlertRepository;
    private final com.library.smart_campus_backend.feature2.service.BookService bookService2;

    public List<StaffAlertDTO> getAlerts(String range) {
        if ("today".equalsIgnoreCase(range)) {
            return alertRepository.findAllByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS)).stream()
                    .map(this::mapToDTO).collect(Collectors.toList());
        } else if ("week".equalsIgnoreCase(range)) {
            return alertRepository.findAllByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime.now().minusWeeks(1)).stream()
                    .map(this::mapToDTO).collect(Collectors.toList());
        }
        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StaffAlertDTO resolveAlert(Long id) {
        StaffAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
        
        alert.setResolved(true);
        alert = alertRepository.save(alert);
        return mapToDTO(alert);
    }
    
    public void markAllRead() {
        List<StaffAlert> alerts = alertRepository.findAll();
        for (StaffAlert alert : alerts) {
            if (!alert.isRead()) {
                alert.setRead(true);
            }
        }
        alertRepository.saveAll(alerts);
    }
    
    public StaffAlertDTO createManualAlert(StaffAlertDTO req) {
        StaffAlert alert = StaffAlert.builder()
            .type("MANUAL")
            .message(req.getMessage())
            .priority(req.getPriority() != null ? req.getPriority() : "LOW")
            .zone(req.getZone())
            .isRead(false)
            .resolved(false)
            .createdAt(java.time.LocalDateTime.now())
            .build();
        return mapToDTO(alertRepository.save(alert));
    }
    
    public void deleteAlert(Long id) {
        if (!alertRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found");
        }
        alertRepository.deleteById(id);
    }

    public List<com.library.smart_campus_backend.feature3.dto.Feature3BookDTO> searchBooks(String q) {
        var feature2Books = bookService2.searchBooks(q);
        return feature2Books.stream().map(b -> 
            com.library.smart_campus_backend.feature3.dto.Feature3BookDTO.builder()
                .id(b.getId())
                .title(b.getTitle())
                .author(b.getAuthor())
                .isbn(b.getIsbn())
                .shelf(b.getShelf())
                .section(b.getFloor()) // Map floor to section to keep DTO shape
                .status(b.getStatus().name())
                .build()
        ).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public com.library.smart_campus_backend.feature3.dto.Feature3BookDTO updateBookStatus(Long id, String status) {
        var oldBook = bookService2.getBookDetails(id);
        String oldStatus = oldBook.getStatus().name();
        
        var updatedBook = bookService2.updateBookStatus(id, com.library.smart_campus_backend.feature2.model.BookStatus.valueOf(status));

        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(username).orElseThrow();

        shelvingLogRepository.save(com.library.smart_campus_backend.feature3.model.Feature3ShelvingLog.builder()
            .bookId(id)
            .staffId(user.getId())
            .oldStatus(oldStatus)
            .newStatus(status)
            .createdAt(java.time.LocalDateTime.now())
            .build());

        return com.library.smart_campus_backend.feature3.dto.Feature3BookDTO.builder()
                .id(updatedBook.getId())
                .title(updatedBook.getTitle())
                .author(updatedBook.getAuthor())
                .isbn(updatedBook.getIsbn())
                .shelf(updatedBook.getShelf())
                .section(updatedBook.getFloor())
                .status(updatedBook.getStatus().name())
                .build();
    }

    public List<com.library.smart_campus_backend.feature3.dto.Feature3ShelvingLogDTO> getShelvingLogs(Long bookId) {
        return shelvingLogRepository.findAll().stream()
                .filter(log -> log.getBookId().equals(bookId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(log -> {
                    var u = userRepository.findById(log.getStaffId());
                    return com.library.smart_campus_backend.feature3.dto.Feature3ShelvingLogDTO.builder()
                            .id(log.getId())
                            .bookId(log.getBookId())
                            .staffId(log.getStaffId())
                            .staffName(u.isPresent() ? u.get().getName() : "Unknown Staff")
                            .oldStatus(log.getOldStatus())
                            .newStatus(log.getNewStatus())
                            .createdAt(log.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }


    @org.springframework.transaction.annotation.Transactional
    public com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO updateSpaceStatus(Long id, String status) {
        var space = spaceRepository.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND));
        
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.HOURS);
        
        var activeRes = reservationRepository.findByReservationDateAndStatusIn(
            today, List.of(com.library.smart_campus_backend.feature1.model.ReservationStatus.RESERVED, com.library.smart_campus_backend.feature1.model.ReservationStatus.CHECKED_IN)
        );
        var currentRes = activeRes.stream().filter(r -> r.getSpace().getId().equals(id) && !now.isBefore(r.getStartTime()) && now.isBefore(r.getEndTime())).findFirst();
        
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(username).orElseThrow();

        if ("AVAILABLE".equalsIgnoreCase(status)) {
            currentRes.ifPresent(r -> reservationRepository.delete(r));
        } else {
            var resStatus = "RESERVED".equalsIgnoreCase(status) ? com.library.smart_campus_backend.feature1.model.ReservationStatus.RESERVED : com.library.smart_campus_backend.feature1.model.ReservationStatus.CHECKED_IN;
            if (currentRes.isPresent()) {
                currentRes.get().setStatus(resStatus);
                reservationRepository.save(currentRes.get());
            } else {
                reservationRepository.save(com.library.smart_campus_backend.feature1.model.Reservation.builder()
                    .code(java.util.UUID.randomUUID().toString().substring(0,8))
                    .user(user)
                    .space(space)
                    .reservationDate(today)
                    .startTime(now)
                    .endTime(now.plusHours(1))
                    .status(resStatus)
                    .createdAt(java.time.LocalDateTime.now())
                    .build());
            }
        }
        
        // FR-05 link: when a desk changes to AVAILABLE
        if ("AVAILABLE".equalsIgnoreCase(status)) {
            long activeAlerts = zoneAlertRepository.findAll().stream()
                .filter(a -> a.getZone().equals(space.getZone().name()) && Boolean.TRUE.equals(a.getActive()))
                .count();
                
            alertRepository.save(StaffAlert.builder()
                .type("SEATING")
                .message("Desk " + space.getName() + " in " + space.getZone().name() + " is now AVAILABLE. " + activeAlerts + " active student alerts exist for this zone.")
                .priority("HIGH")
                .zone(space.getZone().name())
                .isRead(false)
                .resolved(false)
                .createdAt(java.time.LocalDateTime.now())
                .build());
        }
        
        return buildSpaceSummary(space, status);
    }
    
    private com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO buildSpaceSummary(com.library.smart_campus_backend.feature1.model.Space space, String status) {
        List<String> amenities = new java.util.ArrayList<>();
        if (Boolean.TRUE.equals(space.getHasPowerOutlet())) amenities.add("Power Outlet");
        if (Boolean.TRUE.equals(space.getHasDesktopPc())) amenities.add("Desktop PC");

        return com.library.smart_campus_backend.feature1.dto.SpaceSummaryDTO.builder()
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

    public com.library.smart_campus_backend.feature3.dto.Feature3DashboardDTO getDashboard(com.library.smart_campus_backend.feature1.service.SpaceService spaceService) {
        long unresolved = alertRepository.findAll().stream().filter(a -> !a.isResolved()).count();
        return com.library.smart_campus_backend.feature3.dto.Feature3DashboardDTO.builder()
            .zones(spaceService.getZoneSummaries())
            .unresolvedAlerts(unresolved)
            .build();
    }

    public com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO getSettings() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(username).orElseThrow();
        var settings = settingRepository.findByUserId(user.getId())
            .orElse(com.library.smart_campus_backend.feature3.model.Feature3StaffSetting.builder().userId(user.getId()).pushAlerts(true).emailDigest(false).build());
        return new com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO(settings.isPushAlerts(), settings.isEmailDigest());
    }

    public com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO updateSettings(com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO dto) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(username).orElseThrow();
        var settings = settingRepository.findByUserId(user.getId())
            .orElse(com.library.smart_campus_backend.feature3.model.Feature3StaffSetting.builder().userId(user.getId()).build());
        settings.setPushAlerts(dto.isPushAlerts());
        settings.setEmailDigest(dto.isEmailDigest());
        settingRepository.save(settings);
        return new com.library.smart_campus_backend.feature3.dto.Feature3StaffSettingDTO(settings.isPushAlerts(), settings.isEmailDigest());
    }

    private com.library.smart_campus_backend.feature3.dto.Feature3BookDTO mapBookToDTO(com.library.smart_campus_backend.feature3.model.Feature3Book book) {
        return com.library.smart_campus_backend.feature3.dto.Feature3BookDTO.builder()
            .id(book.getId())
            .title(book.getTitle())
            .author(book.getAuthor())
            .isbn(book.getIsbn())
            .shelf(book.getShelf())
            .section(book.getSection())
            .status(book.getStatus())
            .build();
    }

    private StaffAlertDTO mapToDTO(StaffAlert alert) {
        return StaffAlertDTO.builder()
                .id(alert.getId())
                .type(alert.getType())
                .message(alert.getMessage())
                .priority(alert.getPriority())
                .zone(alert.getZone())
                .isRead(alert.isRead())
                .resolved(alert.isResolved())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
