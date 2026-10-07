package com.library.smart_campus_backend.feature2.service;

import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature2.dto.AlertRequestDTO;
import com.library.smart_campus_backend.feature2.dto.AlertResponseDTO;
import com.library.smart_campus_backend.feature2.model.AlertStatus;
import com.library.smart_campus_backend.feature2.model.Book;
import com.library.smart_campus_backend.feature2.model.BookStatus;
import com.library.smart_campus_backend.feature2.model.RestockAlert;
import com.library.smart_campus_backend.feature2.repository.BookRepository;
import com.library.smart_campus_backend.feature2.repository.RestockAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final RestockAlertRepository alertRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    @Transactional
    public AlertResponseDTO createAlert(AlertRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        if (book.getStatus() == BookStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book is already available");
        }

        RestockAlert alert = RestockAlert.builder()
                .user(user)
                .book(book)
                .channels(request.getChannels())
                .status(AlertStatus.WAITING)
                .activeAlertKey(user.getId() + "_" + book.getId())
                .build();

        try {
            alert = alertRepository.saveAndFlush(alert);
            return mapToDTO(alert);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an active alert for this book");
        }
    }

    @Transactional(readOnly = true)
    public List<AlertResponseDTO> getMyAlerts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<RestockAlert> alerts = alertRepository.findByUserIdAndStatusInOrderByStatusAscCreatedAtDesc(
            user.getId(), List.of(AlertStatus.NOTIFIED, AlertStatus.WAITING));
        return alerts.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void cancelAlert(Long id, String email) {
        RestockAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (!alert.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your alert");
        }

        if (alert.getStatus() != AlertStatus.WAITING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alert is already " + alert.getStatus());
        }

        alert.setStatus(AlertStatus.CANCELLED);
        alert.setActiveAlertKey(null);
        alertRepository.save(alert);
    }

    @Transactional
    public AlertResponseDTO updateAlertChannels(Long id, List<com.library.smart_campus_backend.feature2.model.AlertChannel> channels, String email) {
        RestockAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (!alert.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your alert");
        }

        if (alert.getStatus() != AlertStatus.WAITING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alert is already " + alert.getStatus());
        }

        alert.setChannels(channels);
        return mapToDTO(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponseDTO markAlertRead(Long id, String email) {
        RestockAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (!alert.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your alert");
        }

        if (alert.getStatus() != AlertStatus.NOTIFIED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only NOTIFIED alerts can be marked as read");
        }

        alert.setIsRead(true);
        return mapToDTO(alertRepository.save(alert));
    }

    private AlertResponseDTO mapToDTO(RestockAlert alert) {
        return AlertResponseDTO.builder()
                .id(alert.getId())
                .book(bookService.mapToDTO(alert.getBook()))
                .channels(alert.getChannels())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .isRead(alert.getIsRead())
                .notifiedAt(alert.getNotifiedAt())
                .build();
    }
}
