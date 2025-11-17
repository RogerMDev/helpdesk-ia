package com.helpdesk.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.UserRoles;

public interface UserRolesRepository extends JpaRepository<UserRoles, Integer> {
  Optional<UserRoles> findByName(String name);
}
