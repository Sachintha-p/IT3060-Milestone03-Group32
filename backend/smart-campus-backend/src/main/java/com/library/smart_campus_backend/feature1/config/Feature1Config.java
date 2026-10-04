package com.library.smart_campus_backend.feature1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class Feature1Config {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Asia/Colombo"));
    }
}
