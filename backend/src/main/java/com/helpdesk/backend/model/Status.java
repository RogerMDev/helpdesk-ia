package com.helpdesk.backend.model;

import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "status",
       uniqueConstraints = {
           @UniqueConstraint(name = "status_name_unique", columnNames = {"name"})
       })
public class Status {

    @Id
    @Column(name = "status_id_pk", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    private Set<Ticket> tickets = new HashSet<>();

    public Status() {}

    public Status(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<Ticket> getTickets() { return tickets; }
    public void setTickets(Set<Ticket> tickets) { this.tickets = tickets; }
}
