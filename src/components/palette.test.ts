import { describe, expect, it } from 'vitest';
import { paletteColor } from './palette';

describe('paletteColor', () => {
  it('K-04: uses 16 distinct base colors, then generated ones', () => {
    const base = Array.from({ length: 16 }, (_, k) => paletteColor(k));
    expect(new Set(base).size).toBe(16);
    expect(base.every((c) => c.startsWith('#'))).toBe(true);
    expect(paletteColor(16)).toMatch(/^hsl\(/);
    expect(paletteColor(17)).not.toBe(paletteColor(16));
  });
});
