package com.helpdesk.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.Status;

public interface StatusRepository extends JpaRepository<Status, Integer> { }

