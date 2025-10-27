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

import com.helpdesk.backend.model.Attachment;
import com.helpdesk.backend.repository.AttachmentRepository;
import com.helpdesk.backend.repository.TicketRepository;

@RestController
@RequestMapping("/attachments")
public class AttachmentController {

  private final AttachmentRepository attachments;
  private final TicketRepository tickets;

  public AttachmentController(AttachmentRepository attachments, TicketRepository tickets) {
    this.attachments = attachments;
    this.tickets = tickets;
  }

  // ===== DTOs =====
  public record AttachmentResponseDTO(
      Long id,
      Long ticketId,
      String filename,
      String filepath,
      LocalDateTime uploadedAt
  ) {}

  public record CreateAttachmentDTO(
      Long ticketId,
      String filename,
      String filepath
  ) {}

  public record UpdateAttachmentDTO(
      Long ticketId,   // opcional (si lo envías, moverá el adjunto a otro ticket)
      String filename, // opcional
      String filepath  // opcional
  ) {}

  // ===== Mapper =====
  private AttachmentResponseDTO toDto(Attachment a) {
    return new AttachmentResponseDTO(
        a.getId(),
        a.getTicket() != null ? a.getTicket().getId() : null,
        a.getFilename(),
        a.getFilepath(),
        a.getUploadedAt()
    );
  }

  // ===== GET /attachments?ticketId=... =====
  @GetMapping
  @Transactional(readOnly = true)
  public List<AttachmentResponseDTO> list(@RequestParam(required = false) Long ticketId) {
    var list = (ticketId != null) ? attachments.findByTicketId(ticketId) : attachments.findAll();
    return list.stream().map(this::toDto).toList();
  }

  // ===== GET /attachments/{id} =====
  @GetMapping("/{id}")
  @Transactional(readOnly = true)
  public AttachmentResponseDTO getById(@PathVariable Long id) {
    var a = attachments.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Attachment no encontrado con id: " + id));
    return toDto(a);
  }

  // ===== POST /attachments =====
  @PostMapping
  public ResponseEntity<AttachmentResponseDTO> create(@RequestBody CreateAttachmentDTO dto) {
    if (dto == null || dto.ticketId() == null) {
      throw new IllegalArgumentException("ticketId es obligatorio");
    }
    if (dto.filename() == null || dto.filename().isBlank()) {
      throw new IllegalArgumentException("filename es obligatorio");
    }
    if (dto.filepath() == null || dto.filepath().isBlank()) {
      throw new IllegalArgumentException("filepath es obligatorio");
    }

    var ticket = tickets.findById(dto.ticketId())
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + dto.ticketId()));

    var a = new Attachment();
    a.setTicket(ticket);
    a.setFilename(dto.filename().trim());
    a.setFilepath(dto.filepath().trim());

    var saved = attachments.save(a);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .header("Location", "/attachments/" + saved.getId())
        .body(toDto(saved));
  }

  // ===== PUT /attachments/{id} =====
  @PutMapping("/{id}")
  public AttachmentResponseDTO update(@PathVariable Long id, @RequestBody UpdateAttachmentDTO dto) {
    var a = attachments.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Attachment no encontrado con id: " + id));

    if (dto.ticketId() != null) {
      var ticket = tickets.findById(dto.ticketId())
          .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + dto.ticketId()));
      a.setTicket(ticket);
    }
    if (dto.filename() != null) {
      a.setFilename(dto.filename().trim());
    }
    if (dto.filepath() != null) {
      a.setFilepath(dto.filepath().trim());
    }

    var saved = attachments.save(a);
    return toDto(saved);
  }

  // ===== DELETE /attachments/{id} =====
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    var a = attachments.findById(id)
        .orElseThrow(() -> new java.util.NoSuchElementException("Attachment no encontrado con id: " + id));
    attachments.delete(a);
  }
}

