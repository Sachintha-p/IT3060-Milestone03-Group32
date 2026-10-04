package com.library.smart_campus_backend.feature1.repository;

import com.library.smart_campus_backend.feature1.model.ZoneAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ZoneAlertRepository extends JpaRepository<ZoneAlert, Long> {
    List<ZoneAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ZoneAlert> findByIdAndUserId(Long id, Long userId);
}
