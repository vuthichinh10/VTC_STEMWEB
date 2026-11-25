import { describe, expect, it } from 'vitest';
import { syncCodePins } from './code-sync';

describe('syncCodePins', () => {
  it('updates every named GPIO constant from the circuit', () => {
    const source = 'const int BUTTON_PIN=18, LED_PIN=23;';
    const result = syncCodePins(source, [
      { instanceId: 'button-1', moduleId: 'button', gpio: 19 },
      { instanceId: 'led-1', moduleId: 'led', gpio: 25 },
    ]);

    expect(result.code).toBe('const int BUTTON_PIN=19, LED_PIN=25;');
    expect(result.changes).toHaveLength(2);
  });

  it('does not rewrite unrelated numbers or unknown modules', () => {
    const source = 'const int LED_PIN = 23;\ndelay(500);';
    const result = syncCodePins(source, [
      { instanceId: 'sensor-1', moduleId: 'unknown', gpio: 32 },
    ]);

    expect(result.code).toBe(source);
    expect(result.changes).toEqual([]);
  });
});
