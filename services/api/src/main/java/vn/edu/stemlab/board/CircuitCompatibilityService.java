package vn.edu.stemlab.board;

import java.util.*;

public final class CircuitCompatibilityService {
  private CircuitCompatibilityService() {}

  public record Pin(
      int gpio, List<String> capabilities, boolean inputOnly, boolean reserved, String warning) {}

  public record Spec(
      String id, String name, String requiredCapability, List<Integer> suggestedPins) {}

  public record ModuleInstance(String instanceId, String moduleId, int gpio) {}

  public record Issue(
      String severity,
      String code,
      String moduleInstanceId,
      int pin,
      String message,
      List<Integer> suggestedPins) {}

  public static List<Issue> validate(
      List<Pin> pins, List<Spec> specs, List<ModuleInstance> modules) {
    var issues = new ArrayList<Issue>();
    var byPin = new HashMap<Integer, Pin>();
    var bySpec = new HashMap<String, Spec>();
    pins.forEach(pin -> byPin.put(pin.gpio(), pin));
    specs.forEach(spec -> bySpec.put(spec.id(), spec));
    var occupied = new HashMap<Integer, String>();
    for (var module : modules) {
      var spec = bySpec.get(module.moduleId());
      var pin = byPin.get(module.gpio());
      if (spec == null) {
        issues.add(
            new Issue(
                "ERROR",
                "MODULE_UNKNOWN",
                module.instanceId(),
                module.gpio(),
                "Module không tồn tại trong danh mục đã công bố.",
                List.of()));
        continue;
      }
      var suggestions =
          spec.suggestedPins().stream().filter(p -> !occupied.containsKey(p)).toList();
      if (pin == null) {
        issues.add(
            new Issue(
                "ERROR",
                "PIN_UNKNOWN",
                module.instanceId(),
                module.gpio(),
                "GPIO" + module.gpio() + " không có trong hồ sơ board.",
                suggestions));
        continue;
      }
      if (pin.reserved())
        issues.add(
            new Issue(
                "ERROR",
                "PIN_RESERVED",
                module.instanceId(),
                module.gpio(),
                "Chân này được dành riêng.",
                suggestions));
      else if (!pin.capabilities().contains(spec.requiredCapability()))
        issues.add(
            new Issue(
                "ERROR",
                pin.inputOnly() ? "PIN_INPUT_ONLY" : "PIN_INCOMPATIBLE",
                module.instanceId(),
                module.gpio(),
                "GPIO"
                    + module.gpio()
                    + " không hỗ trợ "
                    + spec.requiredCapability()
                    + " mà "
                    + spec.name()
                    + " yêu cầu.",
                suggestions));
      var first = occupied.putIfAbsent(module.gpio(), module.instanceId());
      if (first != null)
        issues.add(
            new Issue(
                "ERROR",
                "PIN_CONFLICT",
                module.instanceId(),
                module.gpio(),
                "GPIO" + module.gpio() + " đã được " + first + " sử dụng.",
                suggestions));
      if (pin.warning() != null)
        issues.add(
            new Issue(
                "WARNING",
                "PIN_WARNING",
                module.instanceId(),
                module.gpio(),
                pin.warning(),
                suggestions));
    }
    return issues;
  }
}
