package com.library.smart_campus_backend.feature2.dto;

import com.library.smart_campus_backend.feature2.model.AlertChannel;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AlertRequestDTO {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotEmpty(message = "At least one channel must be selected")
    private List<AlertChannel> channels;
}
