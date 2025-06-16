# 🚀 Blog Application Setup Guide

## 📋 Prerequisites

- **Node.js**: Version 18+ or 20+ LTS
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd blog_v2/Blog

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Setup

#### Backend Environment Variables

Create `.env` file in the `Blog/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
DEBUG=true

# Database Configuration
MONGO=mongodb://localhost:27017/blog_db

# Authentication (REQUIRED - Generate a secure secret)
JWT_SECRET=your_super_secret_jwt_key_here_at_least_32_characters
```

#### Frontend Environment Variables

Create `.env.local` file in the `Blog/client/` directory:

```env
# Debug Configuration
VITE_DEBUG_MODE=true

# Firebase Configuration (for Google Auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Database Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Windows: Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongodb  # Linux
brew services start mongodb/brew/mongodb-community  # macOS
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGO` in `.env`

## 🎯 Development

### Start Development Servers

```bash
# Terminal 1: Start backend (from Blog directory)
npm run dev

# Terminal 2: Start frontend (from Blog directory)
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🔒 Security Features

### Current Security Implementations

✅ **Authentication Security**
- Secure JWT tokens with HttpOnly cookies
- Cookie security attributes (secure, sameSite)
- Password hashing with bcrypt

✅ **Input Validation**
- Server-side validation middleware
- Email, username, and password validation
- Input sanitization

✅ **Rate Limiting**
- General API rate limiting (100 req/15min)
- Authentication rate limiting (5 req/15min)

✅ **Security Headers**
- Helmet.js for security headers
- CORS configuration
- Request size limits

✅ **Logging & Monitoring**
- Centralized logging system
- Error tracking (development)
- Sanitized debug output

## 🧪 Testing

```bash
# Run backend tests (when implemented)
npm test

# Run frontend tests (when implemented)
cd client
npm test
```

## 📦 Production Deployment

### Environment Variables for Production

```env
# Backend (.env)
NODE_ENV=production
DEBUG=false
PORT=3000
MONGO=your_production_mongodb_uri
JWT_SECRET=secure_production_secret_at_least_32_characters

# Frontend (.env.local)
VITE_DEBUG_MODE=false
```

### Build Commands

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🛠️ Development Tools

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build both frontend and backend

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔍 Debugging

### Debug Mode

Set `VITE_DEBUG_MODE=true` in client environment to enable detailed logging.

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **JWT Secret Missing**
   - Ensure `JWT_SECRET` is set in `.env`
   - Generate a secure secret (32+ characters)

3. **CORS Issues**
   - Check `cors` configuration in `api/index.js`
   - Verify frontend URL in allowed origins

## 📚 Project Structure

```
Blog/
├── api/                 # Backend Express server
│   ├── controllers/     # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions & middleware
│   └── index.js        # Server entry point
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── redux/      # State management
│   │   ├── utils/      # Utility functions
│   │   └── config/     # Configuration files
│   └── vite.config.js  # Vite configuration
└── package.json        # Root dependencies
```

## 🆘 Support

If you encounter issues:

1. Check this setup guide
2. Review error messages in the console
3. Verify environment variables are set correctly
4. Check MongoDB connection
5. Ensure all dependencies are installed

## 🔄 Recent Security Improvements

1. **Fixed Authentication Bugs**
   - Corrected variable reference errors
   - Added proper cookie security

2. **Added Input Validation**
   - Server-side validation middleware
   - Sanitization of user inputs

3. **Implemented Rate Limiting**
   - Protected against brute force attacks
   - Separate limits for auth endpoints

4. **Enhanced Error Handling**
   - Centralized error logging
   - User-friendly error messages
   - Debug utilities for development 