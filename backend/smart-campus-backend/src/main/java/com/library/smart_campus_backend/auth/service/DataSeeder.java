package com.library.smart_campus_backend.auth.service;

import com.library.smart_campus_backend.auth.model.Role;
import com.library.smart_campus_backend.auth.model.User;
import com.library.smart_campus_backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SEED_ADMIN_EMAIL:admin@sliit.lk}")
    private String adminEmail;
    
    @Value("${SEED_ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Value("${SEED_STAFF_EMAIL:staff@sliit.lk}")
    private String staffEmail;

    @Value("${SEED_STAFF_PASSWORD:staff123}")
    private String staffPassword;
    
    @Value("${SEED_STUDENT1_EMAIL:it20000000@my.sliit.lk}")
    private String student1Email;
    @Value("${SEED_STUDENT1_ID:IT20000000}")
    private String student1Id;
    @Value("${SEED_STUDENT_PASSWORD:student123}")
    private String studentPassword;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(adminEmail)) {
            userRepository.save(User.builder()
                    .name("Library Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build());
            System.out.println("Seeded ADMIN: " + adminEmail);
        }
        
        if (!userRepository.existsByEmail(staffEmail)) {
            userRepository.save(User.builder()
                    .name("Library Staff")
                    .email(staffEmail)
                    .password(passwordEncoder.encode(staffPassword))
                    .role(Role.STAFF)
                    .build());
            System.out.println("Seeded STAFF: " + staffEmail);
        }
        
        if (!userRepository.existsByEmail(student1Email)) {
            userRepository.save(User.builder()
                    .name("Student One")
                    .email(student1Email)
                    .studentId(student1Id)
                    .password(passwordEncoder.encode(studentPassword))
                    .role(Role.STUDENT)
                    .build());
            System.out.println("Seeded STUDENT: " + student1Email + " / " + student1Id);
        }
        
        if (!userRepository.existsByEmail("it20000001@my.sliit.lk")) {
            userRepository.save(User.builder()
                    .name("Student Two")
                    .email("it20000001@my.sliit.lk")
                    .studentId("IT20000001")
                    .password(passwordEncoder.encode(studentPassword))
                    .role(Role.STUDENT)
                    .build());
            System.out.println("Seeded STUDENT: it20000001@my.sliit.lk / IT20000001");
        }
        
        if (!userRepository.existsByEmail("it20000002@my.sliit.lk")) {
            userRepository.save(User.builder()
                    .name("Student Three")
                    .email("it20000002@my.sliit.lk")
                    .studentId("IT20000002")
                    .password(passwordEncoder.encode(studentPassword))
                    .role(Role.STUDENT)
                    .build());
            System.out.println("Seeded STUDENT: it20000002@my.sliit.lk / IT20000002");
        }
    }
}
