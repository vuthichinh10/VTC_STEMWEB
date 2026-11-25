package vn.edu.stemlab.progress;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1/lessons/{lessonId}/progress")
public class ProgressController {
  private final JdbcClient db;

  public ProgressController(JdbcClient db) {
    this.db = db;
  }

  public record ProgressView(
      String lessonId,
      int step,
      String prediction,
      String observation,
      String conclusion,
      boolean completed,
      Instant updatedAt) {}

  public record Update(
      @Min(0) @Max(3) int step,
      @Size(max = 4000) String prediction,
      @Size(max = 4000) String observation,
      @Size(max = 4000) String conclusion,
      boolean completed) {}

  @GetMapping
  ProgressView get(@PathVariable String lessonId, Principal principal) {
    UUID uid = userId(principal);
    return db.sql("select * from lesson_progress where user_id=:u and lesson_id=:l")
        .param("u", uid)
        .param("l", lessonId)
        .query((r, n) -> map(r))
        .optional()
        .orElse(new ProgressView(lessonId, 0, "", "", "", false, null));
  }

  @PutMapping
  ProgressView save(
      @PathVariable String lessonId, @Valid @RequestBody Update x, Principal principal) {
    UUID uid = userId(principal);
    boolean validLesson =
        db.sql("select count(*) from lessons where id=:l")
                .param("l", lessonId)
                .query(Integer.class)
                .single()
            > 0;
    if (!validLesson)
      throw new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Không tìm thấy bài học.");
    boolean complete =
        x.completed()
            && !blank(x.prediction())
            && !blank(x.observation())
            && !blank(x.conclusion());
    db.sql(
            "insert into lesson_progress(user_id,lesson_id,step,prediction,observation,conclusion,completed,updated_at) values(:u,:l,:s,:p,:o,:c,:d,now()) on conflict(user_id,lesson_id) do update set step=excluded.step,prediction=excluded.prediction,observation=excluded.observation,conclusion=excluded.conclusion,completed=excluded.completed,updated_at=now()")
        .param("u", uid)
        .param("l", lessonId)
        .param("s", x.step())
        .param("p", safe(x.prediction()))
        .param("o", safe(x.observation()))
        .param("c", safe(x.conclusion()))
        .param("d", complete)
        .update();
    return get(lessonId, principal);
  }

  private ProgressView map(java.sql.ResultSet r) throws java.sql.SQLException {
    return new ProgressView(
        r.getString("lesson_id"),
        r.getInt("step"),
        r.getString("prediction"),
        r.getString("observation"),
        r.getString("conclusion"),
        r.getBoolean("completed"),
        r.getTimestamp("updated_at").toInstant());
  }

  private UUID userId(Principal p) {
    if (p == null)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Em cần đăng nhập để lưu tiến độ.");
    return db.sql("select id from users where username=:u")
        .param("u", p.getName())
        .query(UUID.class)
        .single();
  }

  private boolean blank(String s) {
    return s == null || s.isBlank();
  }

  private String safe(String s) {
    return s == null ? "" : s;
  }
}
