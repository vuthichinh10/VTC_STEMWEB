package vn.edu.stemlab.iam;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class AuthPasswordPolicyTest {
  @Test
  void bcryptNeverStoresPlainText() {
    var encoder = new BCryptPasswordEncoder(12);
    var encoded = encoder.encode("hoc-stem-2026");
    assertThat(encoded).doesNotContain("hoc-stem-2026");
    assertThat(encoder.matches("hoc-stem-2026", encoded)).isTrue();
  }
}
