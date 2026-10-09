package com.library.smart_campus_backend.feature3.repository;

import com.library.smart_campus_backend.feature3.model.Feature3ShelvingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Feature3ShelvingLogRepository extends JpaRepository<Feature3ShelvingLog, Long> {
    List<Feature3ShelvingLog> findTop20ByOrderByCreatedAtDesc();
}
