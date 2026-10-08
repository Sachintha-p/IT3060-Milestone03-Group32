package com.library.smart_campus_backend.feature4.repository;

import com.library.smart_campus_backend.feature4.model.Feature4AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Feature4AdminSettingRepository extends JpaRepository<Feature4AdminSetting, Long> {
}
