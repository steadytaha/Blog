# Chatbot Setup Guide

## Environment Variables Required

Add the following to your `.env` file in the `Blog` directory:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

You can get your OpenAI API key from: https://platform.openai.com/api-keys

## Features

### 🌍 Multilingual Support
- Automatically detects user's language (Turkish/English)
- Responds in the same language as user's message
- Uses Turkish words and character patterns for detection

### 💬 Session Management
- Maintains conversation history per user
- Sessions automatically expire after 1 hour of inactivity
- Context-aware responses based on chat history

### 📚 Blog Content Integration
- Searches through blog posts using keywords
- Provides relevant article recommendations
- Can answer questions about specific posts
- Includes post titles, categories, and content previews

### 🔧 Capabilities
1. **Small talk** - General conversation within tech/development context
2. **Blog post queries** - Search and retrieve information from posts
3. **Author information** - Details about Taha Efe Gümüş and projects
4. **Site navigation** - Help with blog features and usage

### 🚫 Limitations
- Only responds to blog-related topics, author info, or general conversation
- Politely redirects off-topic requests
- Rate limited to 5 requests per minute per user

### 🛡️ Security
- Requires user authentication
- Rate limiting per IP and per user
- Input validation and sanitization
- Session cleanup for memory management

## API Endpoints

- `POST /api/chatbot` - Send message to chatbot
- `DELETE /api/chatbot/clear` - Clear user's chat history

## Usage Examples

**Turkish:**
- "Merhaba, blog hakkında bilgi verebilir misin?"
- "React ile ilgili yazılar var mı?"

**English:**
- "Hello, can you tell me about the blog?"
- "Do you have any posts about React?"

## Logging & Analytics

### 📊 Comprehensive Logging System

The chatbot includes a detailed logging system that tracks:

**Interaction Logs (`/Blog/logs/chatbot.log`)**
- User messages and bot responses
- Response times and session lengths
- Language detection results
- Post retrieval success

**Analytics Logs (`/Blog/logs/chatbot-analytics.log`)**
- Session starts/ends and durations
- Language usage statistics
- OpenAI API token consumption
- Rate limiting events

**Error Logs (`/Blog/logs/chatbot-errors.log`)**
- API failures and error details
- Invalid requests and validation errors
- System errors with full context

### 📈 Admin Analytics Dashboard

Admins can access real-time analytics via the `ChatbotAnalytics` component:
- Daily usage statistics
- Language breakdown (Turkish vs English)
- Token consumption and estimated costs
- Rate limiting and error monitoring

### 🗂️ Log Management

- **Automatic cleanup**: Logs older than 30 days are automatically removed
- **File rotation**: Prevents log files from growing too large
- **Structured data**: All logs are JSON formatted for easy parsing
- **Console output**: Real-time monitoring in development

### 📍 Accessing Analytics

**Admin Route**: `/api/chatbot/analytics?period=[week|month|year|all]`

**Time Periods Available**:
- `week` - Current week (Sunday to Saturday)
- `month` - Current month (1st to last day)
- `year` - Current year (January to December)
- `all` - All time data

**Example Response**:
```json
{
  "success": true,
  "period": "week",
  "dateRange": {
    "start": "2024-01-14",
    "end": "2024-01-20",
    "period": "week"
  },
  "stats": {
    "totalInteractions": 45,
    "uniqueUsers": 12,
    "languageBreakdown": { "tr": 25, "en": 20, "other": 0 },
    "sessionsStarted": 15,
    "totalTokensUsed": 3500,
    "rateLimitHits": 2,
    "averageSessionLength": 8
  }
}
```

## Development Notes

- Sessions stored in memory (use Redis in production)
- Language detection uses simple pattern matching
- Post search uses MongoDB regex queries
- Temperature set to 0.1 for consistent responses
- Logs are stored in `/Blog/logs/` directory
- Analytics available for last 30 days 

## Security - Admin-Only Access 🔒

### Multi-Layer Security for Analytics Dashboard

The chatbot analytics dashboard is protected by **four layers of security**:

#### 1. Frontend Route Protection
- **AdminRoute Component**: Automatic redirect for non-admin users
- **Permission Check**: Real-time verification of admin status
- **Loading States**: Secure loading while verifying permissions

#### 2. Component-Level Access Control
- **ChatbotAnalytics Component**: Multiple admin checks with redirect
- **Error Handling**: Graceful handling of access denied scenarios
- **Automatic Redirects**: Non-admin users redirected to home page after 2 seconds

#### 3. Navigation Restrictions
- **Classic Sidebar**: Chatbot link only visible to admin users
- **Modern Sidebar**: Analytics option only available for administrators
- **Conditional Rendering**: Links hidden from non-admin users entirely

#### 4. Backend API Security
- **JWT Verification**: Required valid authentication token
- **Admin Role Check**: Server-side verification of admin privileges
- **Access Logging**: All access attempts logged with IP tracking
- **Error Logging**: Unauthorized attempts recorded for security monitoring

### Security Features

```javascript
// Frontend Protection
if (!currentUser?.isAdmin) {
  navigate('/'); // Immediate redirect
  return;
}

// Backend Protection  
if (!req.user.isAdmin) {
  // Log unauthorized attempt
  console.warn(`⚠️ Unauthorized analytics access attempt by user ${req.user.id}`);
  return next(errorHandler(403, "Access denied. Admin privileges required."));
}
```

### Access Attempt Monitoring
- **IP Tracking**: All access attempts logged with source IP
- **User Identification**: Failed attempts linked to user accounts
- **Security Alerts**: Console warnings for unauthorized access attempts
- **Audit Trail**: Complete access history maintained in logs

## Installation

### Prerequisites
- Node.js and npm installed
- MongoDB database running
- OpenAI API key

### Environment Variables
Add to your `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Dependencies

**Backend:**
```bash
npm install openai express-rate-limit
```

**Frontend:**
```bash
npm install react-router-dom
```

## API Endpoints

### Chatbot Chat
```
POST /api/chatbot
Content-Type: application/json

{
  "message": "Your message here"
}
```

**Features:**
- Rate limited to 5 requests/minute/IP
- Automatic language detection
- Session management
- Post search capabilities

### Analytics (Admin Only)
```
GET /api/chatbot/analytics?period=[week|month|year|all]
Authorization: Bearer <jwt_token>
```

**Security:**
- Requires valid JWT token
- Admin role verification
- Access attempt logging
- IP tracking

## Usage

### For Users
1. Navigate to any page with the chatbot
2. Click the chatbot icon to open
3. Type messages in Turkish or English
4. Ask about blog posts, author info, or general questions

### For Administrators
1. Sign in as admin user
2. Navigate to Dashboard → Chatbot Analytics
3. View real-time usage statistics
4. Monitor token consumption and costs
5. Review error reports and security logs

## Analytics Dashboard Features

### Overview Cards
- **Total Chats**: Complete interaction count
- **Unique Users**: Number of distinct users
- **Sessions**: Started conversation sessions
- **Rate Limits**: Blocked requests due to rate limiting

### Language Analysis
- **Turkish Usage**: 🇹🇷 Turkish language interactions
- **English Usage**: 🇺🇸 English language interactions
- **Detection Accuracy**: Language identification success rate

### Token Monitoring
- **OpenAI Usage**: Total tokens consumed
- **Cost Estimation**: Approximate expenses (~$0.00015 per 1K tokens)
- **Average per Chat**: Token efficiency metrics

### Time Period Filtering
- **This Week**: Sunday to Saturday current week
- **This Month**: 1st to last day of current month  
- **This Year**: January to December current year
- **All Time**: Complete historical data (2020-present)

## File Structure

```
Blog/
├── api/
│   ├── controllers/
│   │   └── chatbot.controller.js    # Main chatbot logic
│   ├── utils/
│   │   └── chatbotLogger.js         # Logging system
│   └── routes/
│       └── chatbot.route.js         # API routes
├── client/src/
│   ├── components/
│   │   ├── ChatbotAnalytics.jsx     # Admin dashboard
│   │   ├── AdminRoute.jsx           # Route protection
│   │   ├── DashSidebar.jsx          # Classic navigation
│   │   └── ModernDashSidebar.jsx    # Modern navigation
│   └── utils/
│       └── debug.js                 # Client debugging
└── logs/                            # Log files (auto-created)
    ├── chatbot-interactions.log
    ├── chatbot-analytics.log
    └── chatbot-errors.log
```

## Security Best Practices

### ✅ Implemented Protections
- Multi-layer admin verification
- Automatic redirect for unauthorized users
- Server-side role validation
- Access attempt logging
- IP tracking and monitoring
- Error handling with security alerts

### 🔒 Additional Recommendations
- Regular security log reviews
- Monitor for unusual access patterns
- Keep OpenAI API keys secure
- Regular backup of analytics data
- Update dependencies regularly

## Troubleshooting

### Common Issues

**1. Analytics Not Loading**
- Verify admin role in user profile
- Check browser console for errors
- Ensure valid JWT token

**2. Unauthorized Access Errors**
- Confirm user has admin privileges
- Check backend logs for details
- Verify API endpoint accessibility

**3. Rate Limiting Issues**
- Wait for rate limit reset (1 minute)
- Check IP-based restrictions
- Review rate limit logs

### Debug Mode
Set environment variables for debugging:
```env
NEXT_PUBLIC_DEBUG_MODE=true
DEBUG_MODE=true
```

## Monitoring and Maintenance

### Log Files
- **Location**: `/Blog/logs/`
- **Retention**: 30 days automatic cleanup
- **Format**: JSON structured logs

### Performance Monitoring
- Token usage tracking
- Response time metrics
- Error rate monitoring
- Session duration analysis

### Security Monitoring
- Failed access attempts
- Unusual usage patterns
- Rate limit violations
- Admin privilege escalations

For technical support or security concerns, review the access logs and contact the system administrator. 