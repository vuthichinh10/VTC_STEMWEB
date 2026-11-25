package vn.edu.stemlab.board;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class CircuitCompatibilityServiceTest {
  private final List<CircuitCompatibilityService.Pin> pins =
      List.of(
          new CircuitCompatibilityService.Pin(
              23, List.of("digital-in", "digital-out", "pwm"), false, false, null),
          new CircuitCompatibilityService.Pin(
              34, List.of("digital-in", "adc"), true, false, "Input only"));
  private final List<CircuitCompatibilityService.Spec> specs =
      List.of(new CircuitCompatibilityService.Spec("led", "LED", "digital-out", List.of(23)));

  @Test
  void acceptsCompatibleOutput() {
    assertThat(
            CircuitCompatibilityService.validate(
                pins,
                specs,
                List.of(new CircuitCompatibilityService.ModuleInstance("led-1", "led", 23))))
        .isEmpty();
  }

  @Test
  void rejectsInputOnlyPin() {
    assertThat(
            CircuitCompatibilityService.validate(
                pins,
                specs,
                List.of(new CircuitCompatibilityService.ModuleInstance("led-1", "led", 34))))
        .extracting(CircuitCompatibilityService.Issue::code)
        .contains("PIN_INPUT_ONLY");
  }

  @Test
  void rejectsPinConflict() {
    assertThat(
            CircuitCompatibilityService.validate(
                pins,
                specs,
                List.of(
                    new CircuitCompatibilityService.ModuleInstance("led-1", "led", 23),
                    new CircuitCompatibilityService.ModuleInstance("led-2", "led", 23))))
        .extracting(CircuitCompatibilityService.Issue::code)
        .contains("PIN_CONFLICT");
  }
}
