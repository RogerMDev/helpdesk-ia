package com.helpdesk.backend.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketPriority;
import com.helpdesk.backend.model.TicketStatus;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

@RestController
@RequestMapping("/tickets")
public class TicketController {

  private final TicketRepository tickets;
  private final UserRepository users;

  public TicketController(TicketRepository tickets, UserRepository users) {
    this.tickets = tickets; this.users = users;
  }

  // DTOs simples para no exponer entidades tal cual
  public record CreateTicketDTO(Long createdById, Long assigneeId, String title, String description,
  TicketPriority priority, String topic) {}
  public record UpdateStatusDTO(TicketStatus status) {}

  @GetMapping
  public List<Ticket> list(@RequestParam(value="mine", required=false) Boolean mine, @RequestParam(value="userId", required=false) Long userId) {
    if (Boolean.TRUE.equals(mine) && userId != null) {
      return tickets.findByCreatedById(userId);
    }
    return tickets.findAll();
  }

  @PostMapping
  public Ticket create(@RequestBody CreateTicketDTO dto) {
    var creator = users.findById(dto.createdById())
      .orElseThrow(() -> new RuntimeException("createdById no existe"));
    User assignee = null;
    if (dto.assigneeId() != null) {
      assignee = users.findById(dto.assigneeId()).orElse(null);
    }
    var t = new Ticket();
    t.setCreatedBy(creator);
    t.setAssignee(assignee);
    t.setTitle(dto.title());
    t.setDescription(dto.description());
    t.setPriority(dto.priority() != null ? dto.priority() : TicketPriority.MEDIUM);
    t.setStatus(TicketStatus.OPEN);
    t.setTopic(dto.topic());
    t.setCreatedAt(Instant.now());
    t.setUpdatedAt(Instant.now());
    return tickets.save(t);
  }

  @PatchMapping("/{id}/status")
  public Ticket updateStatus(@PathVariable Long id, @RequestBody UpdateStatusDTO dto) {
    var t = tickets.findById(id).orElseThrow();
    t.setStatus(dto.status());
    if (dto.status() == TicketStatus.RESOLVED) {
      t.setClosedAt(Instant.now());
    }
    t.setUpdatedAt(Instant.now());
    return tickets.save(t);
  }

  @GetMapping("/{id}")
  public Ticket getById(@PathVariable Long id) {
    return tickets.findById(id)
        .orElseThrow(() -> new RuntimeException("Ticket no encontrado con id: " + id));
  }
}
