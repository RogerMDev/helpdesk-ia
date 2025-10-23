package com.helpdesk.backend.controller;

import java.util.List;

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
import com.helpdesk.backend.repository.UserRepository;
import com.helpdesk.backend.repository.UserRolesRepository;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepository users;
  private final UserRolesRepository roles;

  public UserController(UserRepository users, UserRolesRepository roles) {
    this.users = users;
    this.roles = roles;
  }

  // DTOs
  public record UserDTO(Long id, String name, String email, Integer roleId, String roleName) {}
  public record CreateUserDTO(Integer roleId, String name, String email, String password) {}
  public record UpdateUserDTO(Integer roleId, String name, String email) {}

  // Mapper
  private static UserDTO toDTO(User u) {
    return new UserDTO(
        u.getId(),
        u.getName(),
        u.getEmail(),
        u.getRole() != null ? u.getRole().getId() : null,
        u.getRole() != null ? u.getRole().getName() : null
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
    u.setEmail(dto.email());
    u.setPassword(dto.password()); 
    return toDTO(users.save(u));
  }

  // -------- UPDATE (reemplazo parcial) --------
  @PutMapping("/{id}")
  public UserDTO update(@PathVariable Long id, @RequestBody UpdateUserDTO dto) {
    User u = users.findById(id).orElseThrow();
    if (dto.roleId() != null) {
      u.setRole(roles.findById(dto.roleId()).orElseThrow());
    }
    if (dto.name() != null)  u.setName(dto.name());
    if (dto.email() != null) u.setEmail(dto.email());
    return toDTO(users.save(u));
  }

  // -------- DELETE --------
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    users.deleteById(id);
  }
}
