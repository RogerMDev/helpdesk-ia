package com.helpdesk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
  List<Attachment> findByTicketId(Long ticketId);
}
