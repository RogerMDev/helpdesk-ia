package com.helpdesk.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.UserRepository;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepository users;

  public UserController(UserRepository users) {
    this.users = users;
  }

  // Listado
  @GetMapping
  public List<User> list() {
    return users.findAll();
  }

  // Obtener por id
  @GetMapping("/{id}")
  public User get(@PathVariable Long id) {
    return users.findById(id).orElseThrow();
  }
}
