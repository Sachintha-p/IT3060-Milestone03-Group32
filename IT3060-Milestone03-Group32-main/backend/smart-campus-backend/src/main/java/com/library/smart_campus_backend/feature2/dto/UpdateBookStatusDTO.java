package com.library.smart_campus_backend.feature2.dto;

import com.library.smart_campus_backend.feature2.model.BookStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookStatusDTO {
    @NotNull(message = "Status is required")
    private BookStatus status;
}
