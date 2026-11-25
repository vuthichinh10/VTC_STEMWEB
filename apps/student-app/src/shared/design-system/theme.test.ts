import { describe, expect, it } from 'vitest';
import { colors } from './theme';
describe('design tokens', () => {
  it('uses the white and light-green product palette', () => {
    expect(colors.background).toBe('#F4FAF6');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.primary).toBe('#2F8F68');
    expect(colors.primarySoft).toBe('#E8F7EF');
    expect(colors.danger).toBe('#CC5361');
  });
});
