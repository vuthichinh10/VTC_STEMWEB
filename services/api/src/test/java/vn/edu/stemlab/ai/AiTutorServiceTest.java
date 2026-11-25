package vn.edu.stemlab.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class AiTutorServiceTest {
  @Test
  void extractsResponsesApiOutputText() throws Exception {
    var json =
        new ObjectMapper()
            .readTree(
                "{\"output\":[{\"type\":\"message\",\"content\":[{\"type\":\"output_text\",\"text\":\"GPIO34 chỉ hỗ trợ input.\"}]}]}");
    assertThat(AiTutorService.extractText(json)).isEqualTo("GPIO34 chỉ hỗ trợ input.");
  }
}
