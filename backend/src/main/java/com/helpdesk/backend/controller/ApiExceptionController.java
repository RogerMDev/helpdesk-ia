package com.helpdesk.backend.controller;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionController {

  // Recurso no encontrado (ej: getById().orElseThrow() o delete inexistente)
  @ExceptionHandler(NoSuchElementException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Map<String, String> notFound(NoSuchElementException ex) {
    return Map.of(
      "error", "Not Found",
      "message", ex.getMessage() != null ? ex.getMessage() : "Recurso no encontrado"
    );
  }

  // deleteById(id) sobre un id que no existe
  @ExceptionHandler(EmptyResultDataAccessException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Map<String, String> emptyResult(EmptyResultDataAccessException ex) {
    return Map.of("error", "Not Found", "message", "Recurso no encontrado");
  }

  // Violaciones de integridad (FK/UNIQUE, etc.)
  @ExceptionHandler(DataIntegrityViolationException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public Map<String, String> conflict(DataIntegrityViolationException ex) {
    return Map.of("error", "Conflict", "message", "Operación no permitida por restricciones (FK/UNIQUE).");
  }

  // (Opcional) Validaciones @Valid/@NotBlank...
  @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, Object> badRequest(org.springframework.web.bind.MethodArgumentNotValidException ex) {
    var errors = ex.getBindingResult().getFieldErrors()
      .stream().collect(java.util.stream.Collectors.toMap(
        e -> e.getField(), e -> e.getDefaultMessage(), (a,b) -> a));
    return Map.of("error", "Bad Request", "fields", errors);
  }
}

