import { describe, expect, it } from 'vitest';
import { validateCircuit, type BoardProfile, type ModuleSpec } from './compatibility';

const board: BoardProfile = {
  id: 'demo',
  version: 1,
  displayName: 'Demo',
  notice: 'DEMO',
  logicVoltage: 3.3,
  pins: [
    { gpio: 23, label: 'GPIO23', capabilities: ['digital-in', 'digital-out', 'pwm'] },
    { gpio: 34, label: 'GPIO34', capabilities: ['digital-in', 'adc'], inputOnly: true },
  ],
};
const specs: ModuleSpec[] = [
  {
    id: 'led',
    name: 'LED',
    emoji: '💡',
    requiredCapability: 'digital-out',
    suggestedPins: [23],
    safety: 'Điện trở hạn dòng',
  },
];

describe('circuit compatibility', () => {
  it('accepts an output-capable pin', () =>
    expect(
      validateCircuit(board, specs, [{ instanceId: 'led-1', moduleId: 'led', gpio: 23 }]),
    ).toEqual([]));
  it('rejects an input-only pin with a useful suggestion', () => {
    const [issue] = validateCircuit(board, specs, [
      { instanceId: 'led-1', moduleId: 'led', gpio: 34 },
    ]);
    expect(issue.code).toBe('PIN_INPUT_ONLY');
    expect(issue.suggestedPins).toContain(23);
  });
});
