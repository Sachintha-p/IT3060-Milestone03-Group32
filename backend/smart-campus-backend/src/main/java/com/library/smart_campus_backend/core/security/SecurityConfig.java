package com.library.smart_campus_backend.core.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Stateless JWT security configuration.
 * Public routes: /api/auth/**, /v3/api-docs/**, /swagger-ui/**
 * Everything else requires a valid Bearer token.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS using the CorsConfigurationSource bean
            .cors(org.springframework.security.config.Customizer.withDefaults())
            // Disable CSRF — stateless API uses JWT, not cookies
            .csrf(AbstractHttpConfigurer::disable)

            // No HTTP session — every request must carry a token
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Route-level authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",       // login and register
                    "/api/public/**",     // Guest endpoints
                    "/v3/api-docs/**",    // OpenAPI spec
                    "/swagger-ui/**",     // Swagger UI assets
                    "/swagger-ui.html"    // Swagger UI entry point
                ).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/books", "/api/books/{id}").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                response.setContentType("application/json");
                response.setStatus(401);
                response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Invalid or missing token\",\"path\":\"" + request.getRequestURI() + "\"}");
            }))

            // Wire in the DAO provider and the JWT filter
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
