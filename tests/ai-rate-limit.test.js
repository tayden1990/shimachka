const { safeParse } = require('../dist/utils/safe-parse.js');
const { WordExtractor } = require('../dist/services/word-extractor.js');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function testRateLimit() {
  // Mock the GoogleGenerativeAI dependency
  const fakeAI = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => '[{"word":"a","translation":"b","definition":"c"}]' } }) }) };
  const extractor = new WordExtractor('fake-key');
  extractor.genAI = fakeAI;

  let errorCaught = false;
  for (let i = 0; i < 6; ++i) {
    try {
      await extractor.extractWords({ topic: 'test', sourceLanguage: 'en', targetLanguage: 'en' });
    } catch (e) {
      if (e && e.message && e.message.includes('rate limit')) {
        errorCaught = true;
        break;
      } else {
        throw e;
      }
    }
  }
  assert(errorCaught, 'Rate limit should have been triggered');
  console.log('AI rate limit test passed.');
}

testRateLimit();
