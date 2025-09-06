const http = require('http');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8787,
      path,
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testDashboard() {
  // You may need to update the token or port if your local dev server differs
  const token = 'admin_token_admin_default_123456';
  const res = await get('/admin/dashboard', token);
  assert(res.status === 200, 'Dashboard should return 200');
  const json = JSON.parse(res.data);
  assert(json.totalUsers !== undefined, 'Should have totalUsers');
  assert(json.activeUsers !== undefined, 'Should have activeUsers');
  console.log('Admin API dashboard test passed.');
}

testDashboard().catch(e => { console.error(e); process.exit(1); });
