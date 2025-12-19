package com.helpdesk.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {

  @Id
  @Column(name = "token", nullable = false, length = 120)
  private String token;

  @ManyToOne(optional = false)
  @JoinColumn(
      name = "user_id_fk",
      nullable = false,
      foreignKey = @ForeignKey(name = "password_reset_token_user_fk")
  )
  private User user;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "used_at")
  private LocalDateTime usedAt;

  public PasswordResetToken() {}

  public PasswordResetToken(String token, User user, LocalDateTime expiresAt) {
    this.token = token;
    this.user = user;
    this.expiresAt = expiresAt;
  }

  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }

  public User getUser() { return user; }
  public void setUser(User user) { this.user = user; }

  public LocalDateTime getExpiresAt() { return expiresAt; }
  public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

  public LocalDateTime getUsedAt() { return usedAt; }
  public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

  public boolean isUsed() { return usedAt != null; }
  public boolean isExpired(LocalDateTime now) { return expiresAt != null && expiresAt.isBefore(now); }
}
