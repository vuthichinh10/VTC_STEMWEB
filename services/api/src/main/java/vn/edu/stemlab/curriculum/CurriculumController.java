package vn.edu.stemlab.curriculum;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1")
public class CurriculumController {
  private final JdbcClient db;
  private final ObjectMapper json;

  public CurriculumController(JdbcClient db, ObjectMapper json) {
    this.db = db;
    this.json = json;
  }

  public record LessonSummary(
      String id,
      String title,
      String emoji,
      int level,
      int durationMinutes,
      String topic,
      String description,
      List<String> modules) {}

  public record LessonDetail(
      String id,
      String title,
      String emoji,
      int level,
      int durationMinutes,
      String topic,
      String description,
      List<String> modules,
      List<String> goals,
      String question,
      List<String> choices,
      int correctChoice,
      String reason,
      String recipe,
      String experiment,
      String takeaway,
      String defaultCode) {}

  public record ModuleView(
      String id, String name, String emoji, String signal, String summary, String safety) {}

  public record ProjectView(
      String id,
      String title,
      String emoji,
      String difficulty,
      int durationMinutes,
      String description,
      List<String> modules) {}

  @GetMapping("/lessons")
  List<LessonSummary> lessons() {
    return db.sql("select * from lessons where published=true order by sort_order")
        .query(
            (r, n) ->
                new LessonSummary(
                    r.getString("id"),
                    r.getString("title"),
                    r.getString("emoji"),
                    r.getInt("level"),
                    r.getInt("duration_minutes"),
                    r.getString("topic"),
                    r.getString("description"),
                    strings(r.getString("module_ids"))))
        .list();
  }

  @GetMapping("/lessons/{id}")
  LessonDetail lesson(@PathVariable String id) {
    return db.sql("select * from lessons where id=:id and published=true")
        .param("id", id)
        .query(
            (r, n) ->
                new LessonDetail(
                    r.getString("id"),
                    r.getString("title"),
                    r.getString("emoji"),
                    r.getInt("level"),
                    r.getInt("duration_minutes"),
                    r.getString("topic"),
                    r.getString("description"),
                    strings(r.getString("module_ids")),
                    strings(r.getString("goals")),
                    r.getString("question"),
                    strings(r.getString("choices")),
                    r.getInt("correct_choice"),
                    r.getString("reason"),
                    r.getString("recipe"),
                    r.getString("experiment"),
                    r.getString("takeaway"),
                    r.getString("default_code")))
        .optional()
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Không tìm thấy bài học."));
  }

  @GetMapping("/modules")
  List<ModuleView> modules() {
    return db.sql("select * from modules order by sort_order")
        .query(
            (r, n) ->
                new ModuleView(
                    r.getString("id"),
                    r.getString("name"),
                    r.getString("emoji"),
                    r.getString("signal"),
                    r.getString("summary"),
                    r.getString("safety")))
        .list();
  }

  @GetMapping("/curriculum/projects")
  List<ProjectView> projects() {
    return db.sql("select * from curriculum_projects order by sort_order")
        .query(
            (r, n) ->
                new ProjectView(
                    r.getString("id"),
                    r.getString("title"),
                    r.getString("emoji"),
                    r.getString("difficulty"),
                    r.getInt("duration_minutes"),
                    r.getString("description"),
                    strings(r.getString("module_ids"))))
        .list();
  }

  private List<String> strings(String value) {
    try {
      return json.readValue(value, new TypeReference<>() {});
    } catch (Exception e) {
      throw new IllegalStateException("Invalid seed JSON", e);
    }
  }
}
