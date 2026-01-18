package com.helpdesk.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.helpdesk.backend.service.OpenAiAdviceService;

@RestController
@RequestMapping("/advice")
public class AdviceController {

  private final OpenAiAdviceService adviceService;

  public AdviceController(OpenAiAdviceService adviceService) {
    this.adviceService = adviceService;
  }

  public record AdviceRequestDTO(String description) {}
  public record AdviceResponseDTO(String advice, List<String> matchedKeywords) {}

  @PostMapping
  public AdviceResponseDTO getAdvice(@RequestBody AdviceRequestDTO dto) {
    if (dto == null || dto.description() == null || dto.description().trim().isEmpty()) {
      return new AdviceResponseDTO("", List.of());
    }
    try {
      var advice = adviceService.getAdvice(dto.description());
      return new AdviceResponseDTO(advice, List.of());
    } catch (IllegalStateException ex) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
    } catch (RuntimeException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Error al consultar OpenAI.");
    }
  }
}
