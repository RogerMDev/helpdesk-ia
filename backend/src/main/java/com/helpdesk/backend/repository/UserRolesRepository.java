package com.helpdesk.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.UserRoles;

public interface UserRolesRepository extends JpaRepository<UserRoles, Integer> { }
