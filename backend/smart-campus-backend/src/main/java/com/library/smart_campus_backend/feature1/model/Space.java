package com.library.smart_campus_backend.feature1.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feature1_spaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Space {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String floorLabel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Zone zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpaceType type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Boolean hasPowerOutlet;

    @Column(nullable = false)
    private Boolean hasDesktopPc;
}
