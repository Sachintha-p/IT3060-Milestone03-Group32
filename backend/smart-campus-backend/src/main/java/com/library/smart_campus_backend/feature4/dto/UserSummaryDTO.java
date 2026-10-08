package com.library.smart_campus_backend.feature4.dto;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class UserSummaryDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
}
