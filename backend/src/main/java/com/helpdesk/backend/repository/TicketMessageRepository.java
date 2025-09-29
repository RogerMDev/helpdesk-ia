package com.helpdesk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.TicketMessage;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
  List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
