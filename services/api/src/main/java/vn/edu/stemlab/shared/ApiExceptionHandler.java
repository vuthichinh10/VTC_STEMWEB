package vn.edu.stemlab.shared;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<Map<String, Object>> api(ApiException e) {
    return ResponseEntity.status(e.status())
        .body(
            Map.of(
                "code",
                e.code(),
                "message",
                e.getMessage(),
                "timestamp",
                Instant.now().toString()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException e) {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "code",
                "VALIDATION_ERROR",
                "message",
                "Dữ liệu chưa hợp lệ.",
                "timestamp",
                Instant.now().toString()));
  }
}
