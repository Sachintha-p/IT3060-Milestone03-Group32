package com.library.smart_campus_backend.feature3.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feature3_books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature3Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column
    private String shelf;

    @Column
    private String section;

    @Column(nullable = false)
    private String status; // AVAILABLE, CHECKED_OUT, MISSING
}
