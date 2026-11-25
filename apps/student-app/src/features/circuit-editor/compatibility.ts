export type PinCapability = 'digital-in' | 'digital-out' | 'pwm' | 'adc' | 'i2c-sda' | 'i2c-scl';

export interface BoardPin {
  gpio: number;
  label: string;
  capabilities: PinCapability[];
  inputOnly?: boolean;
  reserved?: boolean;
  warning?: string;
}

export interface BoardProfile {
  id: string;
  version: number;
  displayName: string;
  notice: string;
  logicVoltage: number;
  pins: BoardPin[];
}

export interface ModuleSpec {
  id: string;
  name: string;
  emoji: string;
  requiredCapability: PinCapability;
  suggestedPins: number[];
  safety: string;
}

export interface ModuleInstance {
  instanceId: string;
  moduleId: string;
  gpio: number;
}

export interface CompatibilityIssue {
  severity: 'ERROR' | 'WARNING';
  code: string;
  moduleInstanceId: string;
  pin: number;
  message: string;
  suggestedPins: number[];
}

export function validateCircuit(
  board: BoardProfile,
  specs: ModuleSpec[],
  modules: ModuleInstance[],
): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const occupied = new Map<number, string>();
  for (const item of modules) {
    const spec = specs.find((candidate) => candidate.id === item.moduleId);
    const pin = board.pins.find((candidate) => candidate.gpio === item.gpio);
    const suggestions = spec?.suggestedPins.filter((gpio) => !occupied.has(gpio)) ?? [];
    if (!spec) {
      issues.push({
        severity: 'ERROR',
        code: 'MODULE_UNKNOWN',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: 'Module không tồn tại trong danh mục đã công bố.',
        suggestedPins: [],
      });
      continue;
    }
    if (!pin) {
      issues.push({
        severity: 'ERROR',
        code: 'PIN_UNKNOWN',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: `GPIO${item.gpio} không có trong hồ sơ board.`,
        suggestedPins: suggestions,
      });
      continue;
    }
    if (pin.reserved) {
      issues.push({
        severity: 'ERROR',
        code: 'PIN_RESERVED',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: `GPIO${item.gpio} được dành riêng và không thể dùng cho module này.`,
        suggestedPins: suggestions,
      });
    } else if (!pin.capabilities.includes(spec.requiredCapability)) {
      issues.push({
        severity: 'ERROR',
        code: pin.inputOnly ? 'PIN_INPUT_ONLY' : 'PIN_INCOMPATIBLE',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: `GPIO${item.gpio} không hỗ trợ ${spec.requiredCapability} mà ${spec.name} yêu cầu.`,
        suggestedPins: suggestions,
      });
    }
    const first = occupied.get(item.gpio);
    if (first) {
      issues.push({
        severity: 'ERROR',
        code: 'PIN_CONFLICT',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: `GPIO${item.gpio} đã được ${first} sử dụng.`,
        suggestedPins: suggestions,
      });
    } else {
      occupied.set(item.gpio, item.instanceId);
    }
    if (pin.warning) {
      issues.push({
        severity: 'WARNING',
        code: 'PIN_WARNING',
        moduleInstanceId: item.instanceId,
        pin: item.gpio,
        message: pin.warning,
        suggestedPins: suggestions,
      });
    }
  }
  return issues;
}
