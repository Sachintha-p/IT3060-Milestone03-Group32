package com.library.smart_campus_backend.feature2.dto;

import com.library.smart_campus_backend.feature2.model.AlertChannel;
import com.library.smart_campus_backend.feature2.model.AlertStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AlertResponseDTO {
    private Long id;
    private BookDTO book;
    private List<AlertChannel> channels;
    private AlertStatus status;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private LocalDateTime notifiedAt;
}
