package com.helpdesk.backend.model;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "user_roles",
       uniqueConstraints = {@UniqueConstraint(name = "user_roles_name_unique", columnNames = {"name"})})

public class UserRoles {

    @Id
    @Column(name = "user_roles_id_pk", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "isAI", nullable = false)
    private boolean isAI;

    // Bi-directional convenience: users that have this role
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();

    public UserRoles() {}

    public UserRoles(Integer id, String name, String description, boolean isAI) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isAI = isAI;
    }

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isAI() { return isAI; }
    public void setAI(boolean AI) { isAI = AI; }

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }
}
