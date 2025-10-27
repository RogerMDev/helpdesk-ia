package com.helpdesk.backend.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;



@Entity
// Table name is a reserved word in many DBs. In your SQL it's quoted "user".
@Table(name = "\"user\"",
       uniqueConstraints = {
        @UniqueConstraint(name = "user_email_unique", columnNames = {"email"})})
        
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id_pk", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_roles_id_fk", nullable = false,
                foreignKey = @ForeignKey(name = "user_user_roles_id_fk_foreign"))
    private UserRoles role;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Reverse relations for convenience
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @JsonIgnore private Set<Ticket> createdTickets = new HashSet<>();

    @OneToMany(mappedBy = "assignee", fetch = FetchType.LAZY)
    @JsonIgnore private Set<Ticket> assignedTickets = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore private Set<TicketMessage> messages = new HashSet<>();

    public User() {}

    public User(Long id, UserRoles role, String name, String email, String password, LocalDateTime createdAt) {
        this.id = id;
        this.role = role;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserRoles getRole() { return role; }
    public void setRole(UserRoles role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Ticket> getCreatedTickets() { return createdTickets; }
    public void setCreatedTickets(Set<Ticket> createdTickets) { this.createdTickets = createdTickets; }

    public Set<Ticket> getAssignedTickets() { return assignedTickets; }
    public void setAssignedTickets(Set<Ticket> assignedTickets) { this.assignedTickets = assignedTickets; }

    public Set<TicketMessage> getMessages() { return messages; }
    public void setMessages(Set<TicketMessage> messages) { this.messages = messages; }
    
}
