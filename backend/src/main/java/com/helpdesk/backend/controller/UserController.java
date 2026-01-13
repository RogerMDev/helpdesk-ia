package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.User;
import com.helpdesk.backend.model.UserRoles;
import com.helpdesk.backend.repository.PasswordResetTokenRepository;
import com.helpdesk.backend.repository.TicketMessageRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;
import com.helpdesk.backend.repository.UserRolesRepository;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepository users;
  private final UserRolesRepository roles;
  private final TicketRepository tickets;
  private final TicketMessageRepository messages;
  private final PasswordResetTokenRepository resetTokens;
  private final String systemEmail;
  private final Integer systemRoleId;

  public UserController(
      UserRepository users,
      UserRolesRepository roles,
      TicketRepository tickets,
      TicketMessageRepository messages,
      PasswordResetTokenRepository resetTokens,
      @Value("${app.system.user-email:system@helpdesk.local}") String systemEmail,
      @Value("${app.system.user-role-id:1}") Integer systemRoleId) {
    this.users = users;
    this.roles = roles;
    this.tickets = tickets;
    this.messages = messages;
    this.resetTokens = resetTokens;
    this.systemEmail = systemEmail;
    this.systemRoleId = systemRoleId;
  }

  // DTOs
  public record UserDTO(Long id, String name, String lastName, String email, String phone,
                       Integer roleId, String roleName, LocalDateTime createdAt) {}
  public record CreateUserDTO(Integer roleId, String name, String email, String password) {}
  public record UpdateUserDTO(Integer roleId, String name, String lastName, String email, String phone) {}

  // Mapper
  private static UserDTO toDTO(User u) {
    return new UserDTO(
        u.getId(),
        u.getName(),
        u.getLastName(),
        u.getEmail(),
        u.getPhone(),
        u.getRole() != null ? u.getRole().getId() : null,
        u.getRole() != null ? u.getRole().getName() : null,
        u.getCreatedAt()
    );
  }

  // -------- READ --------
  @GetMapping
  @Transactional(readOnly = true)
  public List<UserDTO> list() {
    return users.findAll().stream().map(UserController::toDTO).toList();
  }

  @GetMapping("/{id}")
  @Transactional(readOnly = true)
  public UserDTO get(@PathVariable Long id) {
    return users.findById(id).map(UserController::toDTO).orElseThrow();
  }

  // -------- CREATE --------
  @PostMapping
  public UserDTO create(@RequestBody CreateUserDTO dto) {
    UserRoles role = roles.findById(dto.roleId()).orElseThrow();
    User u = new User();
    u.setRole(role);
    u.setName(dto.name());
    u.setLastName(""); // opcional: sin apellidos al crear
    u.setPhone("");
    u.setEmail(dto.email());
    u.setPassword(dto.password()); 
    u.setCreatedAt(LocalDateTime.now());
    return toDTO(users.save(u));
  }

  // -------- UPDATE (reemplazo parcial) --------
  @PutMapping("/{id}")
  public UserDTO update(@PathVariable Long id, @RequestBody UpdateUserDTO dto) {
    User u = users.findById(id).orElseThrow();
    if (dto.roleId() != null) {
      u.setRole(roles.findById(dto.roleId()).orElseThrow());
    }
    if (dto.name() != null)      u.setName(dto.name());
    if (dto.lastName() != null)  u.setLastName(dto.lastName());
    if (dto.email() != null)     u.setEmail(dto.email());
    if (dto.phone() != null)     u.setPhone(dto.phone());
    return toDTO(users.save(u));
  }

  // -------- DELETE -------/
  @DeleteMapping("/{id}")
  @Transactional
  public void delete(@PathVariable Long id) {
    User toDelete = users.findById(id).orElseThrow();
    User systemUser = users.findByEmail(systemEmail).orElseGet(() -> {
      UserRoles role = roles.findById(systemRoleId).orElseThrow();
      User u = new User();
      u.setRole(role);
      u.setName("Sistema");
      u.setLastName("Helpdesk");
      u.setPhone("");
      u.setEmail(systemEmail);
      u.setPassword(UUID.randomUUID().toString());
      u.setCreatedAt(LocalDateTime.now());
      return users.save(u);
    });

    if (systemUser.getId().equals(toDelete.getId())) {
      throw new IllegalArgumentException("No se puede borrar el usuario del sistema");
    }

    tickets.findByAssigneeId(toDelete.getId()).forEach((t) -> {
      t.setAssignee(null);
    });
    tickets.findByCreatedById(toDelete.getId()).forEach((t) -> {
      t.setCreatedBy(systemUser);
    });
    users.flush();

    messages.findByUserId(toDelete.getId()).forEach((m) -> {
      m.setUser(systemUser);
    });

    var tokens = resetTokens.findByUserId(toDelete.getId());
    if (!tokens.isEmpty()) {
      resetTokens.deleteAll(tokens);
    }

    users.delete(toDelete);
  }
}
