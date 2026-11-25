package vn.edu.stemlab.dashboard;

import java.security.Principal;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
  private final JdbcClient db;

  public DashboardController(JdbcClient db) {
    this.db = db;
  }

  public record Stats(
      int completedLessons,
      int totalLessons,
      int completedProjects,
      int groups,
      int pairedDevices,
      String resumeLessonId) {}

  @GetMapping
  Stats stats(Principal p) {
    int total =
        db.sql("select count(*) from lessons where published=true").query(Integer.class).single();
    if (p == null) return new Stats(0, total, 0, 0, 0, "led-on");
    UUID id =
        db.sql("select id from users where username=:u")
            .param("u", p.getName())
            .query(UUID.class)
            .single();
    int done =
        db.sql("select count(*) from lesson_progress where user_id=:u and completed=true")
            .param("u", id)
            .query(Integer.class)
            .single();
    String resume =
        db.sql(
                "select lesson_id from lesson_progress where user_id=:u order by updated_at desc limit 1")
            .param("u", id)
            .query(String.class)
            .optional()
            .orElse("led-on");
    return new Stats(done, total, 0, 0, 0, resume);
  }
}
