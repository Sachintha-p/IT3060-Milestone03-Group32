package com.library.smart_campus_backend.feature3.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature3_shelving_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature3ShelvingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status", nullable = false)
    private String newStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
