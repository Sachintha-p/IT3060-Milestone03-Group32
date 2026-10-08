package com.library.smart_campus_backend.feature3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feature3StaffSettingDTO {
    private boolean pushAlerts;
    private boolean emailDigest;
}
