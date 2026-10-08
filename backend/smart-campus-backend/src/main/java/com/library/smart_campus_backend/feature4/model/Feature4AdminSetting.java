package com.library.smart_campus_backend.feature4.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feature4_admin_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature4AdminSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Integer occupancyThreshold = 90;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoGenerateWeeklyReport = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean allowGuestLookups = true;
}
