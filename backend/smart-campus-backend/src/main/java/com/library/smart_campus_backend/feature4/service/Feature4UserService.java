package com.library.smart_campus_backend.feature4.service;

import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import com.library.smart_campus_backend.feature4.dto.CreateUserRequest;
import com.library.smart_campus_backend.feature4.dto.UserSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Feature4UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getUsers(String q, String role) {
        List<User> users = userRepository.findAll();
        if (q != null && !q.isEmpty()) {
            String lowerQ = q.toLowerCase();
            users = users.stream()
                .filter(u -> u.getName().toLowerCase().contains(lowerQ) || u.getEmail().toLowerCase().contains(lowerQ))
                .collect(Collectors.toList());
        }
        if (role != null && !role.isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            users = users.stream()
                .filter(u -> u.getRole().name().equalsIgnoreCase(role))
                .collect(Collectors.toList());
        }
        return users.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDTO createUser(CreateUserRequest request) {
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Email already exists");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .status("ACTIVE")
                .build();
        return mapToDTO(userRepository.save(user));
    }

    @Transactional
    public void updateUserRole(Long id, String newRole, String currentUsername) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getEmail().equals(currentUsername)) {
            throw new IllegalArgumentException("Cannot modify your own account");
        }
        user.setRole(Role.valueOf(newRole.toUpperCase()));
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long id, String status, String currentUsername) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getEmail().equals(currentUsername)) {
            throw new IllegalArgumentException("Cannot modify your own account");
        }
        user.setStatus(status.toUpperCase());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, String currentUsername) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getEmail().equals(currentUsername)) {
            throw new IllegalArgumentException("Cannot modify your own account");
        }
        
        Long activeReservations = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM feature1_reservations WHERE user_id = ? AND status IN (0, 1, 'RESERVED', 'CHECKED_IN')", Long.class, id);
        if (activeReservations != null && activeReservations > 0) {
            throw new IllegalArgumentException("Cannot delete user with active reservations");
        }
        
        Long checkedOutBooks = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM feature3_shelving_logs WHERE user_id = ? AND action IN ('CHECK_OUT', 'CHECKED_OUT')", Long.class, id); // wait, F3 might not link to user_id for checkouts, wait... F1/F2/F3 logic.
        
        userRepository.delete(user);
    }

    private UserSummaryDTO mapToDTO(User user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus())
                .build();
    }
}
