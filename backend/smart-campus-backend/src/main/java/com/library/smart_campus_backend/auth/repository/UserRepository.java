package com.library.smart_campus_backend.auth.repository;

import com.library.smart_campus_backend.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User}.
 * All basic CRUD is provided by JpaRepository.
 * Custom queries are added here as the project grows.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find a user by their email address (used during login). */
    Optional<User> findByEmail(String email);

    /** Check whether an email is already registered (used during registration). */
    boolean existsByEmail(String email);
}
