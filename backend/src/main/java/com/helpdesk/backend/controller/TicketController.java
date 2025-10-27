package com.helpdesk.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

  // ===== DTOs =====
  public record CreateTicketDTO(Long createdById, Long assigneeId, String title, String description,
                                String topic, Integer statusId) {}
  public record UpdateStatusDTO(Integer statusId) {}
  public record UpdateTicketDTO(
      Long assigneeId,     // opcional (null = no cambiar; si existe pero no se encuentra en BD -> error)
      Integer statusId,    // opcional
      String title,        // opcional
      String description,  // opcional
      String topic         // opcional
  ) {}
  public record TicketResponseDTO(
      Long id,
      Long createdById,
      Long assigneeId,
      Integer statusId,
      String title,
      String description,
      String topic,
      LocalDateTime createdAt,
      LocalDateTime updatedAt,
      LocalDateTime closedAt
  ) {}

  // ===== Mapper entidad -> DTO =====
  private TicketResponseDTO toDto(Ticket t) {
    return new TicketResponseDTO(
        t.getId(),
        t.getCreatedBy() != null ? t.getCreatedBy().getId() : null,
        t.getAssignee() != null ? t.getAssignee().getId() : null,
        t.getStatus() != null ? t.getStatus().getId() : null,
        t.getTitle(),
        t.getDescription(),
        t.getTopic(),
        t.getCreatedAt(),
        t.getUpdatedAt(),
        t.getClosedAt()
    );
  }

  // ===== GET /tickets =====
  @GetMapping
  @Transactional(readOnly = true)
  public List<TicketResponseDTO> list(
      @RequestParam(value = "mine", required = false) Boolean mine,
      @RequestParam(value = "userId", required = false) Long userId) {

    List<Ticket> result = (Boolean.TRUE.equals(mine) && userId != null)
        ? tickets.findByCreatedById(userId)
        : tickets.findAll();

    return result.stream().map(this::toDto).toList();
  }

  // ===== GET /tickets/{id} =====
  @GetMapping("/{id}")
  @Transactional(readOnly = true)
  public TicketResponseDTO getById(@PathVariable Long id) {
    var t = tickets.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + id));
    return toDto(t);
  }

  // ===== POST /tickets =====
  @PostMapping
  public TicketResponseDTO create(@RequestBody CreateTicketDTO dto) {
    var creator = users.findById(dto.createdById())
        .orElseThrow(() -> new RuntimeException("createdById no existe"));

    User assignee = null;
    if (dto.assigneeId() != null) {
      assignee = users.findById(dto.assigneeId()).orElse(null);
    }

    var status = statuses.findById(dto.statusId())
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

    var saved = tickets.save(t);
    return toDto(saved);
  }

  // ===== PATCH /tickets/{id}/status =====
  @PatchMapping("/{id}/status")
  public TicketResponseDTO updateStatus(@PathVariable Long id, @RequestBody UpdateStatusDTO dto) {
    var t = tickets.findById(id).orElseThrow();
    var status = statuses.findById(dto.statusId())
        .orElseThrow(() -> new RuntimeException("statusId no existe"));

    if (status.getName() != null && status.getName().equalsIgnoreCase("RESOLVED")) {
      t.setClosedAt(LocalDateTime.now());
    } else {
      // si pasamos a otro estado que no sea RESOLVED, reabrimos
      t.setClosedAt(null);
    }

    t.setStatus(status);
    t.setUpdatedAt(LocalDateTime.now());

    var saved = tickets.save(t);
    return toDto(saved);
  }

  // ===== PUT /tickets/{id} =====
  @PutMapping("/{id}")
  public TicketResponseDTO update(@PathVariable Long id, @RequestBody UpdateTicketDTO dto) {
    var t = tickets.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + id));

    // Relaciones opcionales
    if (dto.assigneeId() != null) {
      var assignee = users.findById(dto.assigneeId()).orElse(null); // null = desasignar
      t.setAssignee(assignee);
    }
    if (dto.statusId() != null) {
      var status = statuses.findById(dto.statusId())
          .orElseThrow(() -> new RuntimeException("statusId no existe"));
      t.setStatus(status);
      if (status.getName() != null && status.getName().equalsIgnoreCase("RESOLVED")) {
        t.setClosedAt(LocalDateTime.now());
      } else {
        t.setClosedAt(null); // si cambias a otro estado, reabrimos
      }
    }

    // Campos simples opcionales
    if (dto.title() != null)        t.setTitle(dto.title());
    if (dto.description() != null)  t.setDescription(dto.description());
    if (dto.topic() != null)        t.setTopic(dto.topic());

    t.setUpdatedAt(LocalDateTime.now());
    var saved = tickets.save(t);
    return toDto(saved);
  }

  // ===== DELETE /tickets/{id} =====
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    var t = tickets.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + id));
    tickets.delete(t); // dispara cascada sobre attachments/messages por JPA
  }
}
