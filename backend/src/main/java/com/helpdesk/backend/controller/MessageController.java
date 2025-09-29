package com.helpdesk.backend.controller;

import java.time.Instant;
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

@RestController
@RequestMapping("/tickets/{ticketId}/messages")
public class MessageController {
  private final TicketRepository tickets;
  private final TicketMessageRepository messages;

  public MessageController(TicketRepository tickets, TicketMessageRepository messages) {
    this.tickets = tickets; this.messages = messages;
  }

  public record NewMessageDTO(String author, String content) {}

  @GetMapping
  public List<TicketMessage> list(@PathVariable Long ticketId) {
    return messages.findByTicketIdOrderByCreatedAtAsc(ticketId);
  }

  @PostMapping
  public TicketMessage add(@PathVariable Long ticketId, @RequestBody NewMessageDTO dto) {
    var ticket = tickets.findById(ticketId).orElseThrow();
    var m = new TicketMessage();
    m.setTicket(ticket);
    m.setAuthor(dto.author());      // "USER" | "AGENT" | "AI"
    m.setContent(dto.content());
    m.setCreatedAt(Instant.now());
    return messages.save(m);
  }
}
