package com.library.smart_campus_backend.feature2.service;

import com.library.smart_campus_backend.feature2.dto.BookDTO;
import com.library.smart_campus_backend.feature2.model.AlertStatus;
import com.library.smart_campus_backend.feature2.model.Book;
import com.library.smart_campus_backend.feature2.model.BookStatus;
import com.library.smart_campus_backend.feature2.model.RestockAlert;
import com.library.smart_campus_backend.feature2.repository.BookRepository;
import com.library.smart_campus_backend.feature2.repository.RestockAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final RestockAlertRepository alertRepository;
    private final NotificationHelper notificationHelper;

    @Transactional(readOnly = true)
    public List<BookDTO> searchBooks(String search) {
        List<Book> books;
        if (search == null || search.trim().isEmpty()) {
            books = bookRepository.findAll();
        } else {
            books = bookRepository.searchBooks(search);
        }
        return books.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookDTO getBookDetails(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        return mapToDTO(book);
    }

    @Transactional
    public BookDTO updateBookStatus(Long id, BookStatus newStatus) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        
        BookStatus oldStatus = book.getStatus();
        book.setStatus(newStatus);
        bookRepository.save(book);

        // If status changed to AVAILABLE, trigger alerts
        if (oldStatus != BookStatus.AVAILABLE && newStatus == BookStatus.AVAILABLE) {
            triggerAlertsForBook(book);
        }

        return mapToDTO(book);
    }

    private void triggerAlertsForBook(Book book) {
        List<RestockAlert> waitingAlerts = alertRepository.findByBookIdAndStatus(book.getId(), AlertStatus.WAITING);
        for (RestockAlert alert : waitingAlerts) {
            notificationHelper.sendNotification(alert.getUser(), book, alert.getChannels());
            alert.setStatus(AlertStatus.NOTIFIED);
            alert.setNotifiedAt(java.time.LocalDateTime.now());
            alert.setIsRead(false);
            alert.setActiveAlertKey(null);
            alertRepository.save(alert);
        }
    }

    public BookDTO mapToDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .status(book.getStatus())
                .floor(book.getFloor())
                .shelf(book.getShelf())
                .build();
    }
}
