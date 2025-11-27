// src/main/java/com/helpdesk/backend/controller/AuthController.java
package com.helpdesk.backend.controller;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.dto.AuthResponse;
import com.helpdesk.backend.dto.LoginRequest;
import com.helpdesk.backend.dto.RegisterRequest;
import com.helpdesk.backend.dto.UserResponse;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.model.UserRoles;
import com.helpdesk.backend.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository userRepository;

  @PersistenceContext
  private EntityManager em;

  // 👇 Ajusta al ID real del rol por defecto en tu tabla user_roles
  private static final int DEFAULT_ROLE_ID = 3;

  public AuthController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    if (req.getEmail() == null || req.getPassword() == null ||
        req.getName() == null || req.getLastName() == null || req.getPhone() == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "Faltan campos obligatorios"));
    }
    if (userRepository.findByEmail(req.getEmail()).isPresent()) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("message", "Email ya registrado"));
    }

    User u = new User();
    u.setName(req.getName().trim());
    u.setLastName(req.getLastName().trim());
    u.setEmail(req.getEmail().trim());
    u.setPhone(req.getPhone().trim());
    u.setPassword(req.getPassword()); // sin encriptar (como pediste)

    // ✅ Rol por defecto SIN repositorio extra
    UserRoles defaultRoleRef = em.getReference(UserRoles.class, DEFAULT_ROLE_ID);
    u.setRole(defaultRoleRef);

    u.setCreatedAt(java.time.LocalDateTime.now());
    User saved = userRepository.save(u);

    UserResponse out = new UserResponse(
        saved.getId(),
        saved.getRole() != null ? saved.getRole().getId() : null,
        saved.getName(),
        saved.getLastName(),
        saved.getEmail(),
        saved.getPhone(),
        saved.getCreatedAt()
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(out);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    Optional<User> maybe = userRepository.findByEmail(req.getEmail());
    if (maybe.isEmpty() || !req.getPassword().equals(maybe.get().getPassword())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Credenciales incorrectas"));
    }
    User u = maybe.get();
    AuthResponse resp = new AuthResponse(
        UUID.randomUUID().toString(),
        new UserResponse(
            u.getId(),
            u.getRole() != null ? u.getRole().getId() : null,
            u.getName(),
            u.getLastName(),
            u.getEmail(),
            u.getPhone(),
            u.getCreatedAt()
        )
    );
    return ResponseEntity.ok(resp);
  }
}
