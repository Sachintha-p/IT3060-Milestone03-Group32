package com.library.smart_campus_backend.feature3.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feature3_staff_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature3StaffSetting {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "push_alerts", nullable = false)
    private boolean pushAlerts;

    @Column(name = "email_digest", nullable = false)
    private boolean emailDigest;
}
