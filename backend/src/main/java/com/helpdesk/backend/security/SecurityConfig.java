package com.helpdesk.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> {}) // si usas el front luego
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/health", "/tickets/**").permitAll() // ABIERTO para probar
        .anyRequest().permitAll()                              // todo abierto temporalmente
      );
    return http.build();
  }
}
