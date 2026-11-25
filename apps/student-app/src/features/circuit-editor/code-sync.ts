import type { ModuleInstance } from './compatibility';

const PIN_NAMES: Record<string, string> = {
  led: 'LED_PIN',
  button: 'BUTTON_PIN',
  pot: 'POT_PIN',
  ldr: 'LDR_PIN',
  buzzer: 'BUZZER_PIN',
  servo: 'SERVO_PIN',
};

export interface CodePinChange {
  moduleId: string;
  constant: string;
  gpio: number;
}

/**
 * Synchronize the lesson's named pin constants with the logical wiring.
 * Only known constants are changed, so arbitrary student code is left intact.
 */
export function syncCodePins(source: string, modules: ModuleInstance[]) {
  let code = source;
  const changes: CodePinChange[] = [];

  for (const module of modules) {
    const constant = PIN_NAMES[module.moduleId];
    if (!constant) continue;
    const pattern = new RegExp(`(\\b${constant}\\s*=\\s*)\\d+`);
    if (!pattern.test(code)) continue;
    code = code.replace(pattern, `$1${module.gpio}`);
    changes.push({ moduleId: module.moduleId, constant, gpio: module.gpio });
  }

  return { code, changes };
}
