package com.library.smart_campus_backend.feature4.repository;

import com.library.smart_campus_backend.feature4.model.Feature4Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Feature4ReportRepository extends JpaRepository<Feature4Report, Long> {
    List<Feature4Report> findAllByOrderByCreatedAtDesc();
}
