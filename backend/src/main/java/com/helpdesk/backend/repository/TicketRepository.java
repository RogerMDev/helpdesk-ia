package com.helpdesk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
  List<Ticket> findByCreatedById(Long userId);
  List<Ticket> findByAssigneeId(Long userId);
  List<Ticket> findByStatus(TicketStatus status);
}
