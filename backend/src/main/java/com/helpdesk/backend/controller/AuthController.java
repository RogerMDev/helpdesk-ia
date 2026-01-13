// src/main/java/com/helpdesk/backend/controller/AuthController.java
package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.helpdesk.backend.dto.AuthResponse;
import com.helpdesk.backend.dto.ChangePasswordRequest;
import com.helpdesk.backend.dto.ForgotPasswordRequest;
import com.helpdesk.backend.dto.LoginRequest;
import com.helpdesk.backend.dto.RegisterRequest;
import com.helpdesk.backend.dto.ResetPasswordRequest;
import com.helpdesk.backend.dto.UserResponse;
import com.helpdesk.backend.model.PasswordResetToken;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.model.UserRoles;
import com.helpdesk.backend.repository.PasswordResetTokenRepository;
import com.helpdesk.backend.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository userRepository;
  private final PasswordResetTokenRepository resetTokens;
  private final JavaMailSender mailSender;
  private static final Logger log = LoggerFactory.getLogger(AuthController.class);

  @PersistenceContext
  private EntityManager em;

  // 👇 Ajusta al ID real del rol por defecto en tu tabla user_roles
  private static final int DEFAULT_ROLE_ID = 3;

  @Value("${app.reset.base-url:http://localhost:5173/reset-password}")
  private String resetBaseUrl;

  @Value("${app.reset.minutes-valid:30}")
  private long resetMinutesValid;

  @Value("${app.mail.from:no-reply@helpdesk.local}")
  private String mailFrom;

  public AuthController(UserRepository userRepository, PasswordResetTokenRepository resetTokens, JavaMailSender mailSender) {
    this.userRepository = userRepository;
    this.resetTokens = resetTokens;
    this.mailSender = mailSender;
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

  @PostMapping("/forgot-password")
  public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
    if (req == null || req.getEmail() == null || req.getEmail().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "Email requerido"));
    }

    Optional<User> maybe = userRepository.findByEmail(req.getEmail().trim());
    // Siempre respondemos 200 para no filtrar existencia
    if (maybe.isEmpty()) {
      return ResponseEntity.ok(Map.of("message", "Si el email existe, enviaremos un enlace de recuperación"));
    }

    User u = maybe.get();
    String token = UUID.randomUUID().toString();
    LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetMinutesValid);

    PasswordResetToken prt = new PasswordResetToken(token, u, expiresAt);
    resetTokens.save(prt);

    try {
      sendResetEmail(u.getEmail(), token, expiresAt);
    } catch (Exception mailEx) {
      // No rompemos la respuesta para no exponer detalles al usuario final
      log.warn("No se pudo enviar email de reset a {}: {}", u.getEmail(), mailEx.getMessage());
    }

    return ResponseEntity.ok(Map.of("message", "Si el email existe, enviaremos un enlace de recuperación"));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
    if (req == null || req.getToken() == null || req.getToken().isBlank() ||
        req.getPassword() == null || req.getPassword().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "Token y contraseña son obligatorios"));
    }

    PasswordResetToken prt = resetTokens.findByToken(req.getToken())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));

    LocalDateTime now = LocalDateTime.now();
    if (prt.isUsed()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token ya utilizado");
    }
    if (prt.isExpired(now)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token caducado");
    }

    User u = prt.getUser();
    u.setPassword(req.getPassword()); // Nota: sin hash para mantener consistencia con el resto del proyecto
    userRepository.save(u);

    prt.setUsedAt(now);
    resetTokens.save(prt);

    return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
  }

  @PostMapping("/change-password")
  public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
    if (req == null ||
        req.getEmail() == null || req.getEmail().isBlank() ||
        req.getCurrentPassword() == null || req.getCurrentPassword().isBlank() ||
        req.getNewPassword() == null || req.getNewPassword().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "Email, contraseña actual y nueva son obligatorios"));
    }

    User u = userRepository.findByEmail(req.getEmail().trim())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credenciales incorrectas"));

    if (!req.getCurrentPassword().equals(u.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Credenciales incorrectas");
    }

    u.setPassword(req.getNewPassword());
    userRepository.save(u);
    return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
  }

  private void sendResetEmail(String to, String token, LocalDateTime expiresAt) {
    String link = String.format("%s?token=%s", resetBaseUrl, token);
    String body = "Has solicitado restablecer tu contraseña en Helpdesk.\n\n" +
        "Haz clic en el enlace para continuar:\n" + link + "\n\n" +
        "Este enlace caduca el " + expiresAt + ". Si no solicitaste el cambio, ignora este mensaje.";

    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setTo(to);
    msg.setFrom(mailSenderUsername());
    msg.setSubject("Recupera tu contraseña");
    msg.setText(body);
    mailSender.send(msg);
  }

  private String mailSenderUsername() {
    if (mailFrom != null && !mailFrom.isBlank()) {
      return mailFrom;
    }
    if (mailSender instanceof JavaMailSenderImpl impl) {
      String username = impl.getUsername();
      if (username != null && !username.isBlank()) {
        return username;
      }
    }
    return "no-reply@helpdesk.local";
  }
}
