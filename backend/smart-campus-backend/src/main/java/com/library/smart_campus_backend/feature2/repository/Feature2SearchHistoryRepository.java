package com.library.smart_campus_backend.feature2.repository;

import com.library.smart_campus_backend.feature2.model.Feature2SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Feature2SearchHistoryRepository extends JpaRepository<Feature2SearchHistory, Long> {
    List<Feature2SearchHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Feature2SearchHistory> findByUserIdAndQuery(Long userId, String query);
}
