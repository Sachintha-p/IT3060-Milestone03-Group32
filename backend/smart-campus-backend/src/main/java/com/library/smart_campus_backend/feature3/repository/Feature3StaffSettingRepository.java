package com.library.smart_campus_backend.feature3.repository;

import com.library.smart_campus_backend.feature3.model.Feature3StaffSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface Feature3StaffSettingRepository extends JpaRepository<Feature3StaffSetting, Long> {
    Optional<Feature3StaffSetting> findByUserId(Long userId);
}
