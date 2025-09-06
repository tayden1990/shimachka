const https = require('https');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const url = `https://leitner-telegram-bot.t-ak-sa.workers.dev${path}`;
    const options = { headers: token ? { Authorization: `Bearer ${token}` } : {} };
    https.get(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

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

async function getAdminToken() {
  // Use credentials from info.txt
  const res = await post('/admin/login', { username: 'admin', password: 'Taksa4522815' });
  if (res.status !== 200) throw new Error('Login failed: ' + res.data);
  const json = JSON.parse(res.data);
  return json.token;
}

async function testDashboard() {
  const token = await getAdminToken();
  const res = await get('/admin/dashboard', token);
  assert(res.status === 200, 'Dashboard should return 200');
  const json = JSON.parse(res.data);
  assert(json.totalUsers !== undefined, 'Should have totalUsers');
  assert(json.activeUsers !== undefined, 'Should have activeUsers');
  console.log('Admin API dashboard test passed.');
}

testDashboard().catch(e => { console.error(e); process.exit(1); });
