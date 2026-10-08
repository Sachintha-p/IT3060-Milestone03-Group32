package com.library.smart_campus_backend.feature2.model;

import com.library.smart_campus_backend.auth.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feature2_restock_alerts", indexes = {
        @Index(name = "idx_alert_user", columnList = "user_id"),
        @Index(name = "idx_alert_book", columnList = "book_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestockAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "feature2_restock_alert_channels", joinColumns = @JoinColumn(name = "alert_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private List<AlertChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(columnDefinition = "boolean default false")
    private Boolean isRead = false;

    private LocalDateTime notifiedAt;

    @Column(unique = true)
    private String activeAlertKey;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        updateActiveAlertKey();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateActiveAlertKey();
    }

    private void updateActiveAlertKey() {
        if (status == AlertStatus.WAITING) {
            this.activeAlertKey = user.getId() + "_" + book.getId();
        } else {
            this.activeAlertKey = null;
        }
    }
}
