package com.library.smart_campus_backend.feature1.repository;

import com.library.smart_campus_backend.feature1.model.SavedFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SavedFilterRepository extends JpaRepository<SavedFilter, Long> {
    Optional<SavedFilter> findByUserId(Long userId);
}
