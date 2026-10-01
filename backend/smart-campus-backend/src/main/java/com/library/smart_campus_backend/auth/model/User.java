package com.library.smart_campus_backend.auth.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * JPA entity representing a registered library user.
 * Implements {@link UserDetails} so Spring Security can use it directly.
 * The username field is email (unique).
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full display name of the user. */
    @Column(nullable = false)
    private String name;

    /** Used as the login username — must be unique across all users. */
    @Column(unique = true, nullable = false)
    private String email;

    /** BCrypt-hashed password. Never stored as plaintext. */
    @Column(nullable = false)
    private String password;

    /** Role determines which API endpoints the user can access. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // ── UserDetails implementation ────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convention: "ROLE_STUDENT" or "ROLE_ADMIN"
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Spring Security uses email as the username. */
    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
