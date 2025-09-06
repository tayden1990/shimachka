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

async function testUsers() {
  // You may need to update the token or port if your local dev server differs
  const token = 'admin_token_admin_default_123456';
  const res = await get('/admin/users', token);
  assert(res.status === 200, 'Users should return 200');
  const json = JSON.parse(res.data);
  assert(Array.isArray(json), 'Should return an array of users');
  console.log('Admin API users test passed.');
}

testUsers().catch(e => { console.error(e); process.exit(1); });
