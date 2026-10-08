package com.library.smart_campus_backend.feature3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature3BookDTO {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String shelf;
    private String section;
    private String status;
}
