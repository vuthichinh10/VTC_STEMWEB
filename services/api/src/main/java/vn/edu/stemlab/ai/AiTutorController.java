package vn.edu.stemlab.ai;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1/ai/tutor")
public class AiTutorController {
  private final AiTutorService tutor;

  public AiTutorController(AiTutorService tutor) {
    this.tutor = tutor;
  }

  public record Message(
      @Pattern(regexp = "user|assistant") String role,
      @NotBlank @Size(max = 4000) String content) {}

  public record Ask(
      @NotBlank @Size(max = 4000) String question, @Size(max = 8) List<@Valid Message> history) {}

  public record Answer(String answer, String model, Instant createdAt) {}

  public record Status(boolean configured, String model) {}

  @GetMapping("/status")
  Status status(Principal principal) {
    if (principal == null)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Em cần đăng nhập để kiểm tra trợ giảng AI.");
    return tutor.status();
  }

  @PostMapping
  Answer ask(@Valid @RequestBody Ask request, Principal principal) {
    if (principal == null)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Em cần đăng nhập để sử dụng trợ giảng AI.");
    return tutor.ask(request);
  }
}

@Service
class AiTutorService {
  private static final String INSTRUCTIONS =
      """
      Bạn là STEM Coach, trợ giảng tiếng Việt cho học sinh học mạch nhúng, ESP32 và Arduino.
      Chỉ trả lời câu hỏi liên quan tới điện tử, mạch nhúng, vi điều khiển, cảm biến, lập trình firmware,
      đấu nối an toàn và nội dung STEM liên quan trực tiếp. Nếu câu hỏi ngoài phạm vi, hãy từ chối ngắn gọn
      và gợi ý quay lại chủ đề mạch nhúng. Dạy theo kiểu gợi mở, giải thích phù hợp học sinh, đưa ví dụ ngắn.
      Không khẳng định pinout hoặc điện áp nếu thiếu board/module cụ thể. Luôn nhắc kiểm tra datasheet và ngắt nguồn
      trước khi đổi dây. Không hướng dẫn học sinh thao tác điện lưới, tải nguy hiểm, vô hiệu hóa cơ chế an toàn,
      hoặc coi mô phỏng là xác nhận phần cứng. Không tuyên bố đã điều khiển hay kiểm thử thiết bị thật.
      Không yêu cầu thông tin cá nhân, mật khẩu, API key hoặc secret. Trả lời bằng văn bản thuần dễ đọc.
      """;

  private final RestClient http;
  private final String apiKey;
  private final String model;

  AiTutorService(
      RestClient.Builder builder,
      @Value("${app.openai.api-key:}") String apiKey,
      @Value("${app.openai.model:gpt-5.2}") String model,
      @Value("${app.openai.base-url:https://api.openai.com/v1}") String baseUrl) {
    this.http = builder.baseUrl(baseUrl).build();
    this.apiKey = apiKey;
    this.model = model;
  }

  AiTutorController.Answer ask(AiTutorController.Ask request) {
    if (apiKey.isBlank())
      throw new ApiException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "AI_NOT_CONFIGURED",
          "Trợ giảng AI chưa được cấu hình OPENAI_API_KEY trên máy chủ.");
    StringBuilder conversation = new StringBuilder();
    if (request.history() != null)
      for (var message : request.history())
        conversation.append(message.role()).append(": ").append(message.content()).append("\n");
    conversation.append("user: ").append(request.question());
    try {
      JsonNode response =
          http.post()
              .uri("/responses")
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
              .body(
                  Map.of(
                      "model",
                      model,
                      "instructions",
                      INSTRUCTIONS,
                      "input",
                      conversation.toString(),
                      "max_output_tokens",
                      900,
                      "store",
                      false))
              .retrieve()
              .body(JsonNode.class);
      String answer = extractText(response);
      if (answer.isBlank())
        throw new ApiException(
            HttpStatus.BAD_GATEWAY,
            "AI_EMPTY_RESPONSE",
            "Trợ giảng chưa tạo được câu trả lời. Em hãy thử lại.");
      return new AiTutorController.Answer(answer, model, Instant.now());
    } catch (ApiException e) {
      throw e;
    } catch (RestClientResponseException e) {
      int status = e.getStatusCode().value();
      if (status == 401 || status == 403)
        throw new ApiException(
            HttpStatus.BAD_GATEWAY,
            "AI_AUTH_FAILED",
            "OpenAI API key không hợp lệ hoặc không có quyền dùng model đã chọn.");
      if (status == 429)
        throw new ApiException(
            HttpStatus.TOO_MANY_REQUESTS,
            "AI_RATE_LIMITED",
            "Trợ giảng AI đang hết quota hoặc bị giới hạn tốc độ. Hãy thử lại sau.");
      if (status == 400 || status == 404)
        throw new ApiException(
            HttpStatus.BAD_GATEWAY,
            "AI_MODEL_ERROR",
            "Model OpenAI chưa đúng hoặc request không được tài khoản hiện tại hỗ trợ.");
      throw new ApiException(
          HttpStatus.BAD_GATEWAY,
          "AI_PROVIDER_ERROR",
          "OpenAI đang từ chối hoặc chưa thể xử lý yêu cầu.");
    } catch (RestClientException e) {
      throw new ApiException(
          HttpStatus.BAD_GATEWAY,
          "AI_PROVIDER_ERROR",
          "Không thể liên hệ trợ giảng AI. Hãy thử lại sau.");
    }
  }

  AiTutorController.Status status() {
    return new AiTutorController.Status(!apiKey.isBlank(), model);
  }

  static String extractText(JsonNode response) {
    if (response == null) return "";
    for (JsonNode output : response.path("output"))
      for (JsonNode content : output.path("content"))
        if ("output_text".equals(content.path("type").asText()))
          return content.path("text").asText("");
    return "";
  }
}
