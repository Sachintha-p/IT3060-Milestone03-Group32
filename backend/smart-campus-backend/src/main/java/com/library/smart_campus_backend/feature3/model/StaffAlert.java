package com.library.smart_campus_backend.feature3.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature3_alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // e.g. "SEATING", "BOOK"

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String priority; // HIGH, MEDIUM, LOW

    @Column(name = "zone")
    private String zone;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(nullable = false)
    private boolean resolved;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
