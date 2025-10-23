package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.TicketMessage;
import com.helpdesk.backend.repository.TicketMessageRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

@RestController
@RequestMapping("/tickets/{ticketId}/messages")
public class MessageController {

  private final TicketRepository tickets;
  private final TicketMessageRepository messages;
  private final UserRepository users;

  public MessageController(TicketRepository tickets,TicketMessageRepository messages,UserRepository users) {
    this.tickets = tickets;
    this.messages = messages;
    this.users = users;
  }

  // Pedimos el userId porque en la tabla existe user_id_fk (no "author")
  public record NewMessageDTO(Long userId, String content) {}

  @GetMapping
  public List<TicketMessage> list(@PathVariable Long ticketId) {
    return messages.findByTicketIdOrderByCreatedAtAsc(ticketId);
  }

  @PostMapping
  public TicketMessage add(@PathVariable Long ticketId, @RequestBody NewMessageDTO dto) {
    var ticket = tickets.findById(ticketId).orElseThrow();
    var user = users.findById(dto.userId()).orElseThrow();

    var m = new TicketMessage();
    m.setTicket(ticket);
    m.setUser(user);
    m.setContent(dto.content());
    m.setCreatedAt(LocalDateTime.now());

    return messages.save(m);
  }
}
  