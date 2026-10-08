package com.library.smart_campus_backend.feature2.controller;

import com.library.smart_campus_backend.core.common.ApiResponse;
import com.library.smart_campus_backend.feature2.dto.BookDTO;
import com.library.smart_campus_backend.feature2.dto.UpdateBookStatusDTO;
import com.library.smart_campus_backend.feature2.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookDTO>>> searchBooks(@RequestParam(required = false) String search) {
        List<BookDTO> books = bookService.searchBooks(search);
        return ResponseEntity.ok(ApiResponse.ok("Books retrieved successfully", books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> getBookDetails(@PathVariable Long id) {
        BookDTO book = bookService.getBookDetails(id);
        return ResponseEntity.ok(ApiResponse.ok("Book retrieved successfully", book));
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookDTO>> updateBookStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookStatusDTO request) {
        BookDTO book = bookService.updateBookStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Book status updated successfully", book));
    }
}
