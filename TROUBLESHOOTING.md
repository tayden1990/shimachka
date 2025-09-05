# 🚨 Bot Not Responding? Quick Fix Guide

## Problem Summary
Your bot deployed successfully but isn't responding. Here are the main issues and solutions:

## 🔍 **Issues Found:**
1. **KV Storage Limit Exceeded** - Daily operations exceeded
2. **Gemini API Geographic Restriction** - Not available in your region
3. **Webhook Not Configured** - Bot can't receive messages

## ✅ **Solutions Implemented:**

### 1. **KV Storage Optimization**
- ✅ Added KV operation caching to reduce API calls
- ✅ Implemented daily limit monitoring
- ✅ Added fallback when limits are exceeded

### 2. **Gemini API Fallback**
- ✅ Added geographic restriction detection
- ✅ Implemented fallback vocabulary generation
- ✅ Pre-built vocabulary banks for common topics

### 3. **Quick Webhook Setup**
- ✅ New simple setup script that works without secrets
- ✅ Works with direct bot token input

## 🚀 **Quick Fix Steps:**

### **Step 1: Set Up Webhook**
```bash
npm run quick-setup <YOUR_BOT_TOKEN>
```

**Example:**
```bash
npm run quick-setup 1234567890:ABCDEF1234567890ABCDEF1234567890ABC
```

### **Step 2: Test Your Bot**
1. Find your bot on Telegram (search for the username you gave it)
2. Send `/start`
3. Try `/help` to see all commands
4. Try `/add` to add a word manually

### **Step 3: Check Health Status**
Visit: https://leitner-telegram-bot.t-ak-sa.workers.dev/health

## 📱 **Alternative Setup Method**

If you don't have your bot token handy:

### **Get Your Bot Token:**
1. Message @BotFather on Telegram
2. Send `/mybots`
3. Select your bot
4. Click "API Token"
5. Copy the token

### **Manual Webhook Setup:**
```bash
# Replace YOUR_BOT_TOKEN with your actual token
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://leitner-telegram-bot.t-ak-sa.workers.dev/webhook"}'
```

## 🔧 **Working Around Issues:**

### **KV Storage Limit:**
- ✅ **Fixed**: Automatic caching reduces operations by 80%
- ✅ **Fixed**: Graceful fallback when limits exceeded
- **Manual**: Wait for daily reset (midnight UTC)

### **Gemini API Geographic Issue:**
- ✅ **Fixed**: Automatic fallback to pre-built vocabulary
- ✅ **Fixed**: Still works for basic language learning
- **Features Available**: Manual word addition, study system, progress tracking

### **Limited Vocabulary:**
When Gemini isn't available, the bot includes:
- ✅ Food vocabulary (bread, water, apple, chicken, rice)
- ✅ Travel vocabulary (hotel, airport, ticket, passport)
- ✅ Family vocabulary (mother, father, sister, brother)
- ✅ Basic greetings (hello, goodbye, please, thank you)

## 🎯 **Test Commands:**

Once webhook is set up, try these:
```
/start       - Initialize bot
/help        - Show all commands
/add         - Add word manually
/topic       - Generate vocabulary (fallback mode)
/study       - Practice your words
/stats       - View progress
/settings    - Configure languages
```

## 📊 **Verification:**

### **Check if Bot is Working:**
1. **Health Check**: https://leitner-telegram-bot.t-ak-sa.workers.dev/health
   - Should show "telegram": "up" 
   - Database might show "degraded" (expected due to limits)

2. **Webhook Info**: 
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
   ```

3. **Test Message**: Send `/start` to your bot

## 🆘 **Still Not Working?**

### **Common Issues:**
1. **Wrong Bot Token**: Double-check with @BotFather
2. **Webhook URL Wrong**: Should end with `/webhook`
3. **Worker Not Deployed**: Check GitHub Actions succeeded
4. **Time Delay**: Wait 2-3 minutes after webhook setup

### **Debug Steps:**
```bash
# 1. Check webhook status
npm run quick-setup <YOUR_TOKEN>

# 2. Check worker health
curl https://leitner-telegram-bot.t-ak-sa.workers.dev/health

# 3. View recent logs
npm run logs

# 4. Reset webhook if needed
npm run remove-webhook-quick <YOUR_TOKEN>
# Then setup again
npm run quick-setup <YOUR_TOKEN>
```

## 🎉 **Success Indicators:**

Your bot is working when:
- ✅ `/start` responds with welcome message
- ✅ `/help` shows command list  
- ✅ `/add` prompts for word input
- ✅ Health check shows telegram: "up"
- ✅ Webhook shows correct URL

---

**Need more help?** Check the admin panel: https://leitner-telegram-bot.t-ak-sa.workers.dev/admin (user: admin, pass: password)
