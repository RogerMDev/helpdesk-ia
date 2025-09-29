package com.helpdesk.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tickets")
public class Ticket {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne @JoinColumn(name="created_by", nullable=false)
  private User createdBy;

  @ManyToOne @JoinColumn(name="assignee_id")
  private User assignee;

  @Column(nullable=false) private String title;
  @Column(nullable=false) private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false) private TicketStatus status = TicketStatus.OPEN;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false) private TicketPriority priority = TicketPriority.MEDIUM;

  private String topic;

  @Column(name="created_at", nullable=false) private Instant createdAt = Instant.now();
  @Column(name="updated_at", nullable=false) private Instant updatedAt = Instant.now();
  @Column(name="closed_at") private Instant closedAt;

  // getters/setters
  public Long getId(){ return id; }
  public void setId(Long id){ this.id = id; }
  public User getCreatedBy(){ return createdBy; }
  public void setCreatedBy(User createdBy){ this.createdBy = createdBy; }
  public User getAssignee(){ return assignee; }
  public void setAssignee(User assignee){ this.assignee = assignee; }
  public String getTitle(){ return title; }
  public void setTitle(String title){ this.title = title; }
  public String getDescription(){ return description; }
  public void setDescription(String description){ this.description = description; }
  public TicketStatus getStatus(){ return status; }
  public void setStatus(TicketStatus status){ this.status = status; }
  public TicketPriority getPriority(){ return priority; }
  public void setPriority(TicketPriority priority){ this.priority = priority; }
  public String getTopic(){ return topic; }
  public void setTopic(String topic){ this.topic = topic; }
  public Instant getCreatedAt(){ return createdAt; }
  public void setCreatedAt(Instant createdAt){ this.createdAt = createdAt; }
  public Instant getUpdatedAt(){ return updatedAt; }
  public void setUpdatedAt(Instant updatedAt){ this.updatedAt = updatedAt; }
  public Instant getClosedAt(){ return closedAt; }
  public void setClosedAt(Instant closedAt){ this.closedAt = closedAt; }
}
