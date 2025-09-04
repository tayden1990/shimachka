// Utility to verify and reset Telegram webhook for your bot
// Usage: node verify-webhook.js

import 'dotenv/config';
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Set this to your deployed endpoint, e.g. https://yourdomain.com/webhook

if (!TELEGRAM_BOT_TOKEN || !WEBHOOK_URL) {
  console.error('Please set TELEGRAM_BOT_TOKEN and WEBHOOK_URL environment variables.');
  process.exit(1);
}

const apiBase = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function getWebhookInfo() {
  const res = await fetch(`${apiBase}/getWebhookInfo`);
  const data = await res.json();
  console.log('Current webhook info:', data);
}

async function setWebhook() {
  const res = await fetch(`${apiBase}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: WEBHOOK_URL })
  });
  const data = await res.json();
  console.log('Set webhook response:', data);
}

(async () => {
  await getWebhookInfo();
  await setWebhook();
  await getWebhookInfo();
})();
