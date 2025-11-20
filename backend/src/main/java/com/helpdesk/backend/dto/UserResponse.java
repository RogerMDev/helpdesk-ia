package com.helpdesk.backend.dto;

public class UserResponse {
  private Long id;
  private Integer roleId;
  private String name;
  private String lastName;
  private String email;
  private String phone;

  public UserResponse() {}

  public UserResponse(Long id, Integer roleId, String name, String lastName, String email, String phone) {
    this.id = id;
    this.roleId = roleId;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Integer getRoleId() { return roleId; }
  public void setRoleId(Integer roleId) { this.roleId = roleId; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
}
