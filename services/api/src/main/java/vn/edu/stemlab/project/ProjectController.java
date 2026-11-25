package vn.edu.stemlab.project;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.stemlab.board.BoardController;
import vn.edu.stemlab.board.CircuitCompatibilityService;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
  private final JdbcClient db;
  private final ObjectMapper json;
  private final BoardController boards;

  public ProjectController(JdbcClient db, ObjectMapper json, BoardController boards) {
    this.db = db;
    this.json = json;
    this.boards = boards;
  }

  public record Create(
      @NotBlank @Size(max = 160) String title,
      @Size(max = 4000) String description,
      @Size(max = 100000) String code,
      List<CircuitCompatibilityService.ModuleInstance> modules) {}

  public record ProjectView(
      UUID id,
      String title,
      String description,
      int version,
      String code,
      List<CircuitCompatibilityService.ModuleInstance> modules,
      Instant updatedAt) {}

  @PostMapping
  @Transactional
  ProjectView create(@Valid @RequestBody Create request, Principal principal) {
    UUID userId = userId(principal);
    var modules =
        request.modules() == null
            ? List.<CircuitCompatibilityService.ModuleInstance>of()
            : request.modules();
    var validation =
        boards.validate(new BoardController.ValidationRequest("esp32-wroom32-demo", 1, modules));
    if (!validation.valid())
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_ENTITY, "PIN_INCOMPATIBLE", "Mạch còn lỗi nên chưa thể lưu.");
    UUID id = UUID.randomUUID();
    db.sql("insert into projects(id,owner_user_id,title,description) values(:id,:u,:t,:d)")
        .param("id", id)
        .param("u", userId)
        .param("t", request.title().trim())
        .param("d", request.description() == null ? "" : request.description())
        .update();
    db.sql(
            "insert into project_revisions(project_id,revision_no,code,circuit,created_by) values(:id,1,:code,cast(:c as jsonb),:u)")
        .param("id", id)
        .param("code", request.code() == null ? "" : request.code())
        .param("c", write(modules))
        .param("u", userId)
        .update();
    return get(id, principal);
  }

  @GetMapping("/{id}")
  ProjectView get(@PathVariable UUID id, Principal principal) {
    UUID userId = userId(principal);
    return db.sql(
            "select p.*,r.code,r.circuit from projects p join project_revisions r on r.project_id=p.id and r.revision_no=p.current_revision where p.id=:id and p.owner_user_id=:u")
        .param("id", id)
        .param("u", userId)
        .query(
            (r, n) ->
                new ProjectView(
                    r.getObject("id", UUID.class),
                    r.getString("title"),
                    r.getString("description"),
                    r.getInt("current_revision"),
                    r.getString("code"),
                    read(r.getString("circuit")),
                    r.getTimestamp("updated_at").toInstant()))
        .optional()
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "PROJECT_NOT_FOUND",
                    "Không tìm thấy dự án hoặc em không có quyền xem."));
  }

  private UUID userId(Principal p) {
    if (p == null)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Em cần đăng nhập để lưu dự án.");
    return db.sql("select id from users where username=:u")
        .param("u", p.getName())
        .query(UUID.class)
        .single();
  }

  private String write(Object value) {
    try {
      return json.writeValueAsString(value);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private List<CircuitCompatibilityService.ModuleInstance> read(String value) {
    try {
      return json.readValue(value, new TypeReference<>() {});
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
