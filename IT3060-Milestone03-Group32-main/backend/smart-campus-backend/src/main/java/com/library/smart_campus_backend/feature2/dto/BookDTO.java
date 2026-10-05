package com.library.smart_campus_backend.feature2.dto;

import com.library.smart_campus_backend.feature2.model.BookStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private BookStatus status;
    private String floor;
    private String shelf;
}
