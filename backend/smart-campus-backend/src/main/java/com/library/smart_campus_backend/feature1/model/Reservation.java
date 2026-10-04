package com.library.smart_campus_backend.feature1.model;

import com.library.smart_campus_backend.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature1_reservations", indexes = {
        @Index(name = "idx_space_date_time", columnList = "space_id, reservationDate, startTime"),
        @Index(name = "idx_user", columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private Space space;

    @Column(nullable = false)
    private LocalDate reservationDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime checkedInAt;

    private LocalDateTime cancelledAt;

    @Column(unique = true)
    private String activeSlotKey;

    @Column(unique = true)
    private String userActiveSlotKey;

    @PrePersist
    @PreUpdate
    public void updateActiveSlotKeys() {
        if (status == ReservationStatus.CANCELLED) {
            this.activeSlotKey = null;
            this.userActiveSlotKey = null;
        } else {
            this.activeSlotKey = space.getId() + "_" + reservationDate + "_" + startTime;
            this.userActiveSlotKey = user.getId() + "_" + reservationDate + "_" + startTime;
        }
    }
}
