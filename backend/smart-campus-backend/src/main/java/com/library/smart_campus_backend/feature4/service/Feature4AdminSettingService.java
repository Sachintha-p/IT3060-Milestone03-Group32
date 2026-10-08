package com.library.smart_campus_backend.feature4.service;

import com.library.smart_campus_backend.feature4.dto.Feature4AdminSettingDTO;
import com.library.smart_campus_backend.feature4.model.Feature4AdminSetting;
import com.library.smart_campus_backend.feature4.repository.Feature4AdminSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Feature4AdminSettingService {

    private final Feature4AdminSettingRepository repository;

    @Transactional
    public Feature4AdminSettingDTO getSettings() {
        Feature4AdminSetting setting = repository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Feature4AdminSetting newSetting = Feature4AdminSetting.builder()
                            .occupancyThreshold(80)
                            .autoGenerateWeeklyReport(true)
                            .allowGuestLookups(true)
                            .build();
                    return repository.save(newSetting);
                });
        return mapToDTO(setting);
    }

    @Transactional
    public Feature4AdminSettingDTO updateSettings(Feature4AdminSettingDTO req) {
        if (req.getOccupancyThreshold() < 0 || req.getOccupancyThreshold() > 100) {
            throw new IllegalArgumentException("Threshold must be between 0 and 100");
        }
        Feature4AdminSetting setting = repository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    Feature4AdminSetting newSetting = Feature4AdminSetting.builder()
                            .occupancyThreshold(80)
                            .autoGenerateWeeklyReport(true)
                            .allowGuestLookups(true)
                            .build();
                    return repository.save(newSetting);
                });
        
        setting.setOccupancyThreshold(req.getOccupancyThreshold());
        setting.setAutoGenerateWeeklyReport(req.getAutoGenerateWeeklyReport());
        setting.setAllowGuestLookups(req.getAllowGuestLookups());
        
        return mapToDTO(repository.save(setting));
    }

    private Feature4AdminSettingDTO mapToDTO(Feature4AdminSetting setting) {
        return Feature4AdminSettingDTO.builder()
                .id(setting.getId())
                .occupancyThreshold(setting.getOccupancyThreshold())
                .autoGenerateWeeklyReport(setting.getAutoGenerateWeeklyReport())
                .allowGuestLookups(setting.getAllowGuestLookups())
                .build();
    }
}
