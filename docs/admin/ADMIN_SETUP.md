# Admin Account Setup

## Default Admin Credentials

A default admin account is automatically created when the bot is first deployed:

```
Username: admin
Password: Set via ADMIN_PASSWORD environment variable/secret
Email: admin@leitnerbot.com
Role: super_admin
```

## Accessing the Admin Panel

1. Navigate to your deployed worker URL + `/admin`
   - Example: `https://your-worker.your-subdomain.workers.dev/admin`

2. Login with the default credentials above

3. **IMPORTANT**: Change the default password immediately after first login for security!

## Admin Panel Features

### Dashboard
- User activity statistics
- System health monitoring
- Recent user registrations
- Study session analytics

### User Management
- View all registered users
- Search and filter users
- User activity logs
- Account management (activate/deactivate)

### Bulk Word Assignment
- Upload word lists for specific users
- Assign vocabulary by topic or difficulty
- Batch operations for multiple users
- Progress tracking for assigned words

### Direct Messaging
- Send messages directly to users
- Broadcast announcements
- Targeted messaging by user segments
- Message delivery confirmation

### Support System
- View and manage support tickets
- Respond to user inquiries
- Priority management
- Ticket resolution tracking

### Analytics & Reports
- Learning progress reports
- User engagement metrics
- Popular topics and words
- System performance data

## Security Notes

### Password Security
- Change default password immediately
- Use strong passwords (min 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Consider using a password manager

### Access Control
- Admin panel requires authentication
- Sessions expire for security
- All admin actions are logged
- Regular security audits recommended

### Environment Variables
Make sure these are properly configured:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
GEMINI_API_KEY=your_gemini_key
WEBHOOK_SECRET=your_webhook_secret
```

## Creating Additional Admin Accounts

Additional admin accounts can be created through the admin panel:

1. Login as super_admin
2. Navigate to User Management
3. Click "Add Admin User"
4. Fill in required details
5. Assign appropriate role:
   - `super_admin`: Full access to all features
   - `admin`: Standard admin access
   - `moderator`: Limited access for content moderation

## Troubleshooting

### Can't Access Admin Panel
1. Check if worker is deployed correctly
2. Verify the URL path includes `/admin`
3. Check browser console for errors
4. Ensure cookies are enabled

### Login Issues
1. Verify credentials are correct
2. Check if admin account was created (check worker logs)
3. Try clearing browser cache/cookies
4. Contact system administrator

### Forgot Password
Currently, password reset must be done through:
1. Cloudflare Workers KV storage direct access
2. Redeployment with new admin initialization
3. Database-level password reset (for advanced users)

## Admin Account Management via Code

If you need to create admin accounts programmatically:

```typescript
import { AdminService } from './services/admin-service';

const adminService = new AdminService(env.LEITNER_DB);

const newAdmin = await adminService.createAdmin({
  username: 'your_username',
  password: 'secure_password_here',
  email: 'admin@yourdomain.com',
  fullName: 'Admin Full Name',
  role: 'admin',
  isActive: true
});
```

## Backup and Recovery

### Regular Backups
- Admin account data is stored in Cloudflare KV
- Consider regular KV exports for backup
- Document admin usernames and roles

### Recovery Procedures
- Keep backup of admin credentials
- Have secondary admin accounts
- Document recovery procedures for your team

---

**Created**: December 2024  
**Last Updated**: December 2024  
**Version**: 1.0.0
