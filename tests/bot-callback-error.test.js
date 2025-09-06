const http = require('http');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8787,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function testBotCallbackError() {
  // Simulate a callback query with an invalid action to trigger error
  const fakeUpdate = {
    update_id: 1,
    callback_query: {
      id: 'testcbid',
      from: { id: 12345, is_bot: false, first_name: 'Test', username: 'testuser' },
      message: { message_id: 1, chat: { id: 12345, type: 'private' }, date: Date.now() },
      data: 'nonexistent_action'
    }
  };
  const res = await post('/webhook', fakeUpdate);
  assert(res.status === 200, 'Webhook should return 200');
  // The bot should log and send a structured error message to the user (check logs for full validation)
  console.log('Bot callback error test sent. Check logs for error message to user.');
}

testBotCallbackError().catch(e => { console.error(e); process.exit(1); });
