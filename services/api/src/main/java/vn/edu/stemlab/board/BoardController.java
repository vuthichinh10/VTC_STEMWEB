package vn.edu.stemlab.board;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1")
public class BoardController {
  private final JdbcClient db;
  private final ObjectMapper json;

  public BoardController(JdbcClient db, ObjectMapper json) {
    this.db = db;
    this.json = json;
  }

  public record BoardPin(
      int gpio,
      String label,
      List<String> capabilities,
      boolean inputOnly,
      boolean reserved,
      String warning) {}

  public record BoardProfile(
      String id,
      int version,
      String displayName,
      String notice,
      double logicVoltage,
      List<BoardPin> pins) {}

  public record ModuleSpec(
      String id,
      String name,
      String emoji,
      String requiredCapability,
      List<Integer> suggestedPins,
      String safety) {}

  public record ValidationRequest(
      @NotBlank String boardProfileId,
      int boardProfileVersion,
      List<CircuitCompatibilityService.ModuleInstance> modules) {}

  public record ValidationResult(boolean valid, List<CircuitCompatibilityService.Issue> issues) {}

  @GetMapping("/board-profiles/{id}")
  BoardProfile profile(@PathVariable String id) {
    var row =
        db.sql("select * from board_profiles where id=:id order by version desc limit 1")
            .param("id", id)
            .query(
                (r, n) ->
                    new BoardProfile(
                        r.getString("id"),
                        r.getInt("version"),
                        r.getString("display_name"),
                        r.getString("notice"),
                        r.getDouble("logic_voltage"),
                        List.of()))
            .optional()
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "BOARD_PROFILE_NOT_FOUND",
                        "Không tìm thấy hồ sơ board."));
    var pins =
        db.sql(
                "select * from board_pins where board_profile_id=:id and board_profile_version=:v order by gpio")
            .param("id", row.id())
            .param("v", row.version())
            .query(
                (r, n) ->
                    new BoardPin(
                        r.getInt("gpio"),
                        r.getString("label"),
                        strings(r.getString("capabilities")),
                        r.getBoolean("input_only"),
                        r.getBoolean("reserved"),
                        r.getString("warning")))
            .list();
    return new BoardProfile(
        row.id(), row.version(), row.displayName(), row.notice(), row.logicVoltage(), pins);
  }

  @GetMapping("/module-specs")
  List<ModuleSpec> specs() {
    return db.sql(
            "select m.id,m.name,m.emoji,m.safety,s.required_capability,s.suggested_pins from modules m join module_specs s on s.module_id=m.id order by m.sort_order")
        .query(
            (r, n) ->
                new ModuleSpec(
                    r.getString("id"),
                    r.getString("name"),
                    r.getString("emoji"),
                    r.getString("required_capability"),
                    integers(r.getString("suggested_pins")),
                    r.getString("safety")))
        .list();
  }

  @PostMapping("/circuits/validate")
  public ValidationResult validate(@Valid @RequestBody ValidationRequest request) {
    var profile = profile(request.boardProfileId());
    if (profile.version() != request.boardProfileVersion())
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "BOARD_PROFILE_VERSION_MISMATCH",
          "Phiên bản hồ sơ board không khớp.");
    var pins =
        profile.pins().stream()
            .map(
                p ->
                    new CircuitCompatibilityService.Pin(
                        p.gpio(), p.capabilities(), p.inputOnly(), p.reserved(), p.warning()))
            .toList();
    var specs =
        specs().stream()
            .map(
                s ->
                    new CircuitCompatibilityService.Spec(
                        s.id(), s.name(), s.requiredCapability(), s.suggestedPins()))
            .toList();
    var issues =
        CircuitCompatibilityService.validate(
            pins, specs, request.modules() == null ? List.of() : request.modules());
    return new ValidationResult(
        issues.stream().noneMatch(i -> i.severity().equals("ERROR")), issues);
  }

  private List<String> strings(String value) {
    try {
      return json.readValue(value, new TypeReference<>() {});
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private List<Integer> integers(String value) {
    try {
      return json.readValue(value, new TypeReference<>() {});
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
