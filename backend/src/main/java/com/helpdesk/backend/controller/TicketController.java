package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.helpdesk.backend.model.Status;
import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.StatusRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

@RestController
@RequestMapping("/tickets")
public class TicketController {

  private final TicketRepository tickets;
  private final UserRepository users;
  private final StatusRepository statuses;

  public TicketController(TicketRepository tickets, UserRepository users, StatusRepository statuses) {
    this.tickets = tickets;
    this.users = users;
    this.statuses = statuses;
  }

  // DTOs: usamos statusId (clave de la tabla status) en lugar de enums inexistentes
  public record CreateTicketDTO(Long createdById, Long assigneeId, String title, String description,
                                String topic, Integer statusId /* obligatorio para crear */) {}
  public record UpdateStatusDTO(Integer statusId) {}

  @GetMapping
  public List<Ticket> list(@RequestParam(value = "mine", required = false) Boolean mine,
                           @RequestParam(value = "userId", required = false) Long userId) {
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
      assignee = users.findById(dto.assigneeId())
          .orElse(null);
    }
    Status status = statuses.findById(dto.statusId())
        .orElseThrow(() -> new RuntimeException("statusId no existe"));

    var t = new Ticket();
    t.setCreatedBy(creator);
    t.setAssignee(assignee);
    t.setTitle(dto.title());
    t.setDescription(dto.description());
    t.setTopic(dto.topic());
    t.setStatus(status);
    t.setCreatedAt(LocalDateTime.now());
    t.setUpdatedAt(LocalDateTime.now());
    return tickets.save(t);
  }

  @PatchMapping("/{id}/status")
  public Ticket updateStatus(@PathVariable Long id, @RequestBody UpdateStatusDTO dto) {
    var t = tickets.findById(id).orElseThrow();
    var status = statuses.findById(dto.statusId())
        .orElseThrow(() -> new RuntimeException("statusId no existe"));

    t.setStatus(status);
    // Cierra si el nombre del status es RESOLVED (ignorando mayúsculas/minúsculas)
    if (status.getName() != null && status.getName().equalsIgnoreCase("RESOLVED")) {
      t.setClosedAt(LocalDateTime.now());
    }
    t.setUpdatedAt(LocalDateTime.now());
    return tickets.save(t);
  }

  @GetMapping("/{id}")
  public Ticket getById(@PathVariable Long id) {
    return tickets.findById(id)
        .orElseThrow(() -> new RuntimeException("Ticket no encontrado con id: " + id));
  }
}
