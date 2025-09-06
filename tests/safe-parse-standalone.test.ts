import { safeParse } from '../src/utils/safe-parse';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function testSafeParse() {
  // Valid JSON
  const obj = safeParse<{ a: number }>(JSON.stringify({ a: 1 }));
  assert(obj !== null && obj.a === 1, 'Failed to parse valid JSON');

  // Invalid JSON with fallback
  const fallback = { b: 2 };
  const obj2 = safeParse<{ b: number }>('not json', fallback);
  assert(obj2 !== null && obj2.b === 2, 'Did not return fallback');

  // Invalid JSON, no fallback
  const obj3 = safeParse<{ c: number }>('not json');
  assert(obj3 === null, 'Did not return null');

  console.log('safeParse standalone tests passed.');
}

testSafeParse();
