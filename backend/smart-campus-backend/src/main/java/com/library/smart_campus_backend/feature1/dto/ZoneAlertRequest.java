package com.library.smart_campus_backend.feature1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZoneAlertRequest {
    @NotBlank
    private String zone;
}
