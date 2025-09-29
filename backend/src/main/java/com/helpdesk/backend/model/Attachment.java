package com.helpdesk.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "attachments")
public class Attachment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne @JoinColumn(name="ticket_id", nullable=false)
  private Ticket ticket;

  @Column(nullable=false) private String filename;
  @Column(name="filepath", nullable=false) private String filepath;

  @Column(name="uploaded_at", nullable=false)
  private Instant uploadedAt = Instant.now();

  // getters/setters
  public Long getId(){ return id; }
  public void setId(Long id){ this.id = id; }
  public Ticket getTicket(){ return ticket; }
  public void setTicket(Ticket ticket){ this.ticket = ticket; }
  public String getFilename(){ return filename; }
  public void setFilename(String filename){ this.filename = filename; }
  public String getFilepath(){ return filepath; }
  public void setFilepath(String filepath){ this.filepath = filepath; }
  public Instant getUploadedAt(){ return uploadedAt; }
  public void setUploadedAt(Instant uploadedAt){ this.uploadedAt = uploadedAt; }
}
