package com.library.smart_campus_backend.feature2.repository;

import com.library.smart_campus_backend.feature2.model.AlertStatus;
import com.library.smart_campus_backend.feature2.model.RestockAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestockAlertRepository extends JpaRepository<RestockAlert, Long> {
    List<RestockAlert> findByUserIdAndStatus(Long userId, AlertStatus status);
    List<RestockAlert> findByBookIdAndStatus(Long bookId, AlertStatus status);
    List<RestockAlert> findByUserIdAndStatusInOrderByStatusAscCreatedAtDesc(Long userId, List<AlertStatus> statuses);
}
