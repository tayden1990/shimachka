const https = require('https');
function post(path, body) {
  return new Promise((resolve, reject) => {
    const url = `https://leitner-telegram-bot.t-ak-sa.workers.dev${path}`;
    const data = JSON.stringify(body);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(url, options, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: resData }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}


function assert(cond, msg) {
  if (!cond) throw new Error(msg);
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
