package com.helpdesk.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> { }
