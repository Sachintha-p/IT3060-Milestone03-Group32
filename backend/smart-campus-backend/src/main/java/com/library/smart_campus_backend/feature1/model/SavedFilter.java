package com.library.smart_campus_backend.feature1.model;

import com.library.smart_campus_backend.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature1_saved_filters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedFilter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String floor;
    
    @Column(name = "zone", length = 500)
    private String zone;
    
    private Boolean hasPower;
    private Boolean hasPc;
    
    private LocalDateTime updatedAt;
}
