package com.library.smart_campus_backend.feature3.repository;

import com.library.smart_campus_backend.feature3.model.StaffAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffAlertRepository extends JpaRepository<StaffAlert, Long> {
    List<StaffAlert> findAllByOrderByCreatedAtDesc();
    List<StaffAlert> findAllByCreatedAtAfterOrderByCreatedAtDesc(java.time.LocalDateTime date);
}
