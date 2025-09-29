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
@Table(name = "ticket_messages")
public class TicketMessage {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne @JoinColumn(name="ticket_id", nullable=false)
  private Ticket ticket;

  @Column(name="author", nullable=false)
  private String author; // "USER" | "AGENT" | "AI" (texto simple, como en tu SQL)

  @Column(nullable=false) private String content;

  @Column(name="created_at", nullable=false)
  private Instant createdAt = Instant.now();

  // getters/setters
  public Long getId(){ return id; }
  public void setId(Long id){ this.id = id; }
  public Ticket getTicket(){ return ticket; }
  public void setTicket(Ticket ticket){ this.ticket = ticket; }
  public String getAuthor(){ return author; }
  public void setAuthor(String author){ this.author = author; }
  public String getContent(){ return content; }
  public void setContent(String content){ this.content = content; }
  public Instant getCreatedAt(){ return createdAt; }
  public void setCreatedAt(Instant createdAt){ this.createdAt = createdAt; }
}
