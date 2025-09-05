// Create admin account script
const https = require('https');

const data = JSON.stringify({
  username: 'admin',
  email: 'admin@leitnerbot.com',
  fullName: 'System Administrator',
  password: 'Taksa4522815',
  role: 'admin'
});

const options = {
  hostname: 'leitner-telegram-bot.t-ak-sa.workers.dev',
  path: '/admin/create-admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', body);
    try {
      const parsed = JSON.parse(body);
      console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
