# Admin System Documentation

## Overview
The Leitner Bot now includes a comprehensive admin system with both API endpoints and bot integration for complete management functionality.

## Admin Features

### 1. Admin Dashboard
- **Endpoint**: `GET /admin/dashboard`
- **Features**: User statistics, activity overview, system metrics
- **Data**: Total users, active users, cards, reviews, support tickets

### 2. User Management
- **Endpoints**: 
  - `GET /admin/users` - List all users with pagination
  - `GET /admin/users/{id}` - Get specific user details
  - `PUT /admin/users/{id}` - Update user information
- **Features**: View user profiles, learning progress, update user data

### 3. Bulk Word Assignment
- **Endpoint**: `POST /admin/bulk-assignment`
- **Features**: Assign vocabulary to multiple users simultaneously
- **Data Structure**:
  ```json
  {
    "targetUserIds": [123, 456],
    "words": [
      {
        "word": "hello",
        "translation": "hola",
        "definition": "greeting",
        "sourceLanguage": "en",
        "targetLanguage": "es"
      }
    ],
    "title": "Assignment Title",
    "description": "Assignment Description"
  }
  ```

### 4. Direct Messaging
- **Endpoint**: `POST /admin/send-message`
- **Features**: Send direct messages to users
- **Bot Integration**: Users receive notifications and can view messages via `/support`

### 5. Support Ticket System
- **Endpoints**: 
  - `GET /admin/tickets` - List support tickets
  - `GET /admin/tickets/{id}` - Get ticket details
- **Bot Integration**: 
  - `/support` - Access support menu
  - `/contact` - Get contact information
  - Complete ticket creation flow with priority selection

### 6. Admin User Management
- **Endpoint**: `POST /admin/create-admin`
- **Features**: Create new admin accounts
- **Required Fields**: username, email, password, fullName, role

## Bot Integration

### New Commands
- `/support` - Opens support menu with options:
  - Create support ticket
  - View direct messages
  - FAQ
  - Contact information
- `/contact` - Direct access to contact information

### Support Ticket Flow
1. User types `/support`
2. Selects "Create Ticket"
3. Provides subject and message
4. Selects priority (Normal/Urgent)
5. Confirms submission
6. Ticket is created and assigned unique ID

### Notification System
- Users receive notifications for:
  - New direct messages from admin
  - Bulk word assignments
  - Support ticket updates

## API Authentication
- Admin endpoints require authentication
- Login endpoint: `POST /admin/login`
- Returns session token for subsequent requests

## Database Schema Extensions

### New Tables
- `admin_users` - Admin user accounts
- `support_tickets` - User support requests
- `direct_messages` - Admin-to-user messages
- `bulk_assignments` - Word assignment batches
- `user_activity` - Activity logging

## Security Features
- CORS protection for admin endpoints
- Admin authentication required
- Activity logging for audit trails
- Input validation and sanitization

## Installation & Setup

1. **Environment Variables**: Ensure all required env vars are set
2. **Admin Creation**: Use `/admin/create-admin` endpoint to create first admin
3. **Bot Commands**: All new commands are automatically registered
4. **Web Interface**: Access admin panel at your domain's root path

## Usage Examples

### Create Admin User
```bash
curl -X POST https://your-domain.com/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "secure-password",
    "fullName": "Admin User",
    "role": "super_admin"
  }'
```

### Send Direct Message
```bash
curl -X POST https://your-domain.com/admin/send-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": 123456789,
    "message": "Welcome to our enhanced vocabulary system!"
  }'
```

### Bulk Word Assignment
```bash
curl -X POST https://your-domain.com/admin/bulk-assignment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserIds": [123456789],
    "words": [
      {
        "word": "excellent",
        "translation": "excelente",
        "definition": "very good",
        "sourceLanguage": "en",
        "targetLanguage": "es"
      }
    ],
    "title": "Daily Vocabulary",
    "description": "Your daily vocabulary assignment"
  }'
```

## Technical Implementation

### File Structure
```
src/
├── api/
│   └── admin-api.ts          # Admin REST API endpoints
├── services/
│   └── admin-service.ts      # Admin business logic
├── types/
│   └── index.ts             # Extended with admin types
├── bot/
│   └── leitner-bot.ts       # Enhanced with admin integration
└── admin/
    └── index.html           # Admin web interface
```

### Key Classes
- **AdminService**: Core admin functionality and database operations
- **AdminAPI**: REST API endpoints with authentication
- **LeitnerBot**: Enhanced with support commands and ticket system

## Future Enhancements
- Real-time dashboard updates
- Email notifications
- Advanced user analytics
- Bulk user operations
- Export/import functionality
- Advanced ticket routing

---

**Note**: This admin system provides a complete management solution for the Leitner learning bot with both programmatic API access and user-friendly bot commands.
