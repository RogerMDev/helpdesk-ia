package com.helpdesk.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OpenAiAdviceService {

  private static final Logger log = LoggerFactory.getLogger(OpenAiAdviceService.class);

  private final ObjectMapper mapper;
  private final HttpClient httpClient;
  private final String apiKey;
  private final String model;
  private final URI baseUri;

  public OpenAiAdviceService(
      ObjectMapper mapper,
      @Value("${app.openai.api-key:}") String apiKey,
      @Value("${app.openai.model:gpt-4.1-nano}") String model,
      @Value("${app.openai.base-url:https://api.openai.com/v1}") String baseUrl) {
    this.mapper = mapper;
    this.apiKey = apiKey != null ? apiKey.trim() : "";
    this.model = model != null && !model.isBlank() ? model.trim() : "gpt-4.1-nano";
    this.baseUri = URI.create(baseUrl.endsWith("/") ? baseUrl : baseUrl + "/");
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();
  }

  public String getAdvice(String description) {
    if (apiKey.isBlank()) {
      throw new IllegalStateException("OPENAI_API_KEY no configurada.");
    }

    var systemPrompt = String.join(" ",
        "Eres un asistente de soporte tecnico.", 
        "Responde solamente preguntas de aspecto tecnico.",
        "Responde en espanol con una solucion breve y clara.",
        "Si falta informacion critica, haz una sola pregunta para aclarar.",
        "No inventes datos.");

    var payload = Map.of(
        "model", model,
        "input", List.of(
            Map.of(
                "role", "system",
                "content", List.of(Map.of("type", "input_text", "text", systemPrompt))
            ),
            Map.of(
                "role", "user",
                "content", List.of(Map.of("type", "input_text", "text", description))
            )
        ),
        "temperature", 0.2,
        "max_output_tokens", 200
    );

    String body;
    try {
      body = mapper.writeValueAsString(payload);
    } catch (Exception ex) {
      throw new RuntimeException("No se pudo serializar la solicitud a OpenAI.", ex);
    }

    var request = HttpRequest.newBuilder(baseUri.resolve("responses"))
        .header("Authorization", "Bearer " + apiKey)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .timeout(Duration.ofSeconds(30))
        .build();

    try {
      var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        log.warn("OpenAI error status={} body={}", response.statusCode(), response.body());
        throw new RuntimeException("OpenAI respondio con error.");
      }
      var json = mapper.readTree(response.body());
      return extractAdvice(json);
    } catch (RuntimeException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new RuntimeException("No se pudo consultar OpenAI.", ex);
    }
  }

  private String extractAdvice(JsonNode root) {
    var direct = root.path("output_text").asText(null);
    if (direct != null && !direct.isBlank()) {
      return direct.trim();
    }
    var output = root.path("output");
    if (output.isArray()) {
      for (var item : output) {
        var content = item.path("content");
        if (content.isArray()) {
          for (var part : content) {
            var text = part.path("text").asText(null);
            if (text != null && !text.isBlank()) {
              return text.trim();
            }
          }
        }
      }
    }
    return "";
  }
}
