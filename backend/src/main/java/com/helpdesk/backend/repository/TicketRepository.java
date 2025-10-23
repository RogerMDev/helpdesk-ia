package com.helpdesk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
  List<Ticket> findByCreatedById(Long createdById);
}
