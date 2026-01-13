package com.helpdesk.backend.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
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
import org.springframework.web.multipart.MultipartFile;

import com.helpdesk.backend.model.Attachment;
import com.helpdesk.backend.repository.AttachmentRepository;
import com.helpdesk.backend.repository.TicketRepository;

@RestController
@RequestMapping("/attachments")
public class AttachmentController {

  private static final Logger log = LoggerFactory.getLogger(AttachmentController.class);

  private final AttachmentRepository attachments;
  private final TicketRepository tickets;
  private final Path attachmentsDir;

  public AttachmentController(
      AttachmentRepository attachments,
      TicketRepository tickets,
      @Value("${app.attachments.dir:attachments}") String attachmentsDir) {
    this.attachments = attachments;
    this.tickets = tickets;
    this.attachmentsDir = Paths.get(attachmentsDir).toAbsolutePath().normalize();
    log.info("Adjuntos guardados en: {}", this.attachmentsDir);
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
    a.setUploadedAt(LocalDateTime.now());

    var saved = attachments.save(a);
    return ResponseEntity
        .status(HttpStatus.CREATED)
        .header("Location", "/attachments/" + saved.getId())
        .body(toDto(saved));
  }

  // ===== POST /attachments/upload =====
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Transactional
  public AttachmentResponseDTO upload(
      @RequestParam("ticketId") Long ticketId,
      @RequestParam("file") MultipartFile file) {
    if (ticketId == null) {
      throw new IllegalArgumentException("ticketId es obligatorio");
    }
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("file es obligatorio");
    }

    var ticket = tickets.findById(ticketId)
        .orElseThrow(() -> new java.util.NoSuchElementException("Ticket no encontrado con id: " + ticketId));

    String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "archivo");
    String storedName = UUID.randomUUID() + "_" + originalName;
    Path target = attachmentsDir.resolve(storedName).normalize();
    if (!target.startsWith(attachmentsDir)) {
      throw new IllegalArgumentException("Ruta de archivo invalida");
    }

    try {
      Files.createDirectories(attachmentsDir);
      file.transferTo(target);
    } catch (IOException ex) {
      throw new RuntimeException("No se pudo guardar el archivo", ex);
    }

    var a = new Attachment();
    a.setTicket(ticket);
    a.setFilename(originalName);
    a.setFilepath("/attachments/files/" + storedName);
    a.setUploadedAt(LocalDateTime.now());

    var saved = attachments.save(a);
    return toDto(saved);
  }

  // ===== GET /attachments/files/{filename} =====
  @GetMapping("/files/{filename:.+}")
  public ResponseEntity<Resource> download(@PathVariable String filename) {
    Path file = attachmentsDir.resolve(filename).normalize();
    if (!file.startsWith(attachmentsDir) || !Files.exists(file) || !Files.isReadable(file)) {
      return ResponseEntity.notFound().build();
    }

    try {
      Resource resource = new UrlResource(file.toUri());
      return ResponseEntity.ok()
          .contentType(MediaType.APPLICATION_OCTET_STREAM)
          .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
          .body(resource);
    } catch (MalformedURLException ex) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
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
