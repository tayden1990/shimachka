import { safeParse } from '../src/utils/safe-parse';

describe('safeParse', () => {
  it('parses valid JSON', () => {
    const obj = safeParse<{ a: number }>(JSON.stringify({ a: 1 }));
    if (!obj || obj.a !== 1) throw new Error('Failed to parse valid JSON');
  });

  it('returns fallback for invalid JSON', () => {
    const fallback = { b: 2 };
    const obj = safeParse<{ b: number }>('not json', fallback);
    if (!obj || obj.b !== 2) throw new Error('Did not return fallback');
  });

  it('returns null for invalid JSON if no fallback', () => {
    const obj = safeParse<{ c: number }>('not json');
    if (obj !== null) throw new Error('Did not return null');
  });
});
