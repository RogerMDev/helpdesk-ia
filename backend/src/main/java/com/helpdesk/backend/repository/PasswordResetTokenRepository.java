package com.helpdesk.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.helpdesk.backend.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
  Optional<PasswordResetToken> findByToken(String token);
  List<PasswordResetToken> findByUserId(Long userId);
}
