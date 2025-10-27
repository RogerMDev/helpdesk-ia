package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.TicketMessage;
import com.helpdesk.backend.repository.TicketMessageRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

@RestController
@RequestMapping("/messages")
public class TicketMessageController {

  private final TicketMessageRepository messages;
  private final TicketRepository tickets;
  private final UserRepository users;

  public TicketMessageController(TicketMessageRepository messages, TicketRepository tickets, UserRepository users) {
    this.messages = messages;
    this.tickets = tickets;
    this.users = users;
  }

  // DTOs
  public record MessageResponseDTO(Long id, Long ticketId, Long userId, String content, LocalDateTime createdAt) {}
  public record CreateMessageDTO(Long ticketId, Long userId, String content) {}
  public record UpdateMessageDTO(String content) {}

  // Mapper
  private MessageResponseDTO toDto(TicketMessage m) {
    return new MessageResponseDTO(
        m.getId(),
        m.getTicket() != null ? m.getTicket().getId() : null,
        m.getUser() != null ? m.getUser().getId() : null,
        m.getContent(),
        m.getCreatedAt()
    );
  }

  // GET /messages?ticketId=...
  @GetMapping
  @Transactional(readOnly = true)
  public List<MessageResponseDTO> list(@RequestParam(required = false) Long ticketId) {
    var list = (ticketId != null)
        ? messages.findByTicketIdOrderByCreatedAtAsc(ticketId)
        : messages.findAll();
    return list.stream().map(this::toDto).toList();
  }

  // GET /messages/{id}
  @GetMapping("/{id}")
  @Transactional(readOnly = true)
  public MessageResponseDTO getById(@PathVariable Long id) {
    var m = messages.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Mensaje no encontrado con id: " + id));
    return toDto(m);
  }

  // POST /messages
  @PostMapping
  public ResponseEntity<MessageResponseDTO> create(@RequestBody CreateMessageDTO dto) {
    if (dto == null || dto.ticketId() == null || dto.userId() == null || dto.content() == null || dto.content().isBlank()) {
      throw new IllegalArgumentException("ticketId, userId y content son obligatorios");
    }
    var ticket = tickets.findById(dto.ticketId())
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + dto.ticketId()));
    var user = users.findById(dto.userId())
        .orElseThrow(() -> new java.util.NoSuchElementException("User no encontrado con id: " + dto.userId()));

    var m = new TicketMessage();
    m.setTicket(ticket);
    m.setUser(user);
    m.setContent(dto.content().trim());

    var saved = messages.save(m);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .header("Location", "/messages/" + saved.getId())
        .body(toDto(saved));
  }

  // PUT /messages/{id}
  @PutMapping("/{id}")
  public MessageResponseDTO update(@PathVariable Long id, @RequestBody UpdateMessageDTO dto) {
    var m = messages.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Mensaje no encontrado con id: " + id));
    if (dto.content() != null && !dto.content().isBlank()) {
      m.setContent(dto.content().trim());
    }
    var saved = messages.save(m);
    return toDto(saved);
  }

  // DELETE /messages/{id}
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    var m = messages.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Mensaje no encontrado con id: " + id));
    messages.delete(m);
  }
}
