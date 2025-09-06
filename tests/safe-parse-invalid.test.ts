const { safeParse } = require('../dist/utils/safe-parse.js');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function testSafeParseInvalid() {
  // Edge: empty string
  const obj1 = safeParse('');
  assert(obj1 === null, 'Empty string should return null');

  // Edge: whitespace
  const obj2 = safeParse('   ');
  assert(obj2 === null, 'Whitespace should return null');

  // Edge: valid JSON but not object
  const obj3 = safeParse('123');
  assert(obj3 === 123, 'Should parse primitive JSON');

  // Edge: array
  const obj4 = safeParse('[1,2,3]');
  assert(Array.isArray(obj4) && obj4.length === 3, 'Should parse array JSON');

  // Edge: fallback with empty string
  const fallback = { fallback: true };
  const obj5 = safeParse('', fallback);
  assert(obj5 === fallback, 'Empty string with fallback should return fallback');

  console.log('safeParse invalid input tests passed.');
}

testSafeParseInvalid();
