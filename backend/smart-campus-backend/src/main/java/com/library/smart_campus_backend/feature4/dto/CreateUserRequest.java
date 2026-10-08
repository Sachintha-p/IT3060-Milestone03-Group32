package com.library.smart_campus_backend.feature4.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String name;
    private String email;
    private String role;
    private String password;
}
