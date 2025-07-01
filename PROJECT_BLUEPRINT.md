# Project Blueprint

This document provides a comprehensive blueprint for the project, including its structure, tech stack, and coding conventions. It is intended to be a guide for developers and AI agents to understand the project and contribute to it consistently.

## 1. Project Overview

This project is a full-stack blog application that allows users to create, read, update, and delete posts. It also includes user authentication, a commenting system, and an admin dashboard for managing users and posts.

## 2. Features

### 2.1. User Authentication

- **Sign Up:** Users can create a new account with a username, email, and password.
- **Sign In:** Users can sign in to their account using their email and password.
- **Sign Out:** Users can sign out of their account.
- **OAuth:** Users can sign in or sign up using their Google account.

### 2.2. Post Management

- **Create Posts:** Authenticated users can create new posts with a title, content, and category.
- **Read Posts:** All users can read posts, which are displayed in a reverse chronological order.
- **Update Posts:** Authenticated users can update their own posts.
- **Delete Posts:** Authenticated users can delete their own posts.

### 2.3. Comment System

- **Create Comments:** Authenticated users can add comments to posts.
- **Read Comments:** All users can read comments on posts.
- **Like Comments:** Authenticated users can like and unlike comments.
- **Edit Comments:** Authenticated users can edit their own comments.
- **Delete Comments:** Authenticated users can delete their own comments.

### 2.4. Admin Dashboard

- **Admin-Only Access:** The dashboard is only accessible to users with an admin role.
- **User Management:** Admins can view and delete users.
- **Post Management:** Admins can view and delete all posts.
- **Comment Management:** Admins can view and delete all comments.

### 2.5. Additional Features

- **Search:** Users can search for posts by title or content.
- **Theming:** Users can switch between light and dark mode.
- **Chatbot:** A chatbot is available to assist users with their queries.

## 3. Tech Stack

### 3.1. Frontend

- **Framework:** React.js
- **UI Library:** Tailwind CSS
- **State Management:** Redux
- **Routing:** React Router
- **Build Tool:** Vite

### 3.2. Backend

- **Framework:** Node.js, Express.js
- **Database:** MongoDB (or a similar NoSQL database)
- **Authentication:** JSON Web Tokens (JWT)
- **Real-time Communication:** Socket.io (for chatbot)

### 3.3. Deployment

- **Hosting:** Render (based on `render.yaml`)
- **CI/CD:** Not specified

## 4. Project Structure

The project is a monorepo with two main directories: `Blog/api` for the backend and `Blog/client` for the frontend.

### 4.1. `Blog/api` (Backend)

The backend is responsible for handling the business logic, database operations, and API endpoints.

```
blog_v2/Blog/api/
├── controllers/
│   ├── auth.controller.js
│   ├── chatbot.controller.js
│   ├── comment.controller.js
│   ├── post.controller.js
│   └── user.controller.js
├── index.js
├── models/
│   ├── comment.model.js
│   ├── post.model.js
│   └── user.model.js
├── README.md
├── routes/
│   ├── auth.route.js
│   ├── chatbot.route.js
│   ├── comment.route.js
│   ├── post.route.js
│   └── user.route.js
└── utils/
    ├── chatbotLogger.js
    ├── debug.js
    ├── error.js
    ├── jsonLoader.js
    ├── logger.js
    ├── validation.js
    └── verifyUser.js
```

### 4.2. `Blog/client` (Frontend)

The frontend is a single-page application (SPA) built with React.js that provides the user interface for the blog.

```
blog_v2/Blog/client/
├── BlogLogo.png
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── src/
│   ├── App.jsx
│   ├── assets/
│   │   └── newLogo-removebg-preview.png
│   ├── chatbot/
│   ├── components/
│   │   ├── AdminPrivateRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── CallToAction.jsx
│   │   ├── ChatbotAnalytics.jsx
│   │   ├── ChatbotPanel.jsx
│   │   ├── Comment.jsx
│   │   ├── GlobeAnimation.css
│   │   ├── GlobeAnimation.jsx
│   │   ├── ModernCommentSection.jsx
│   │   ├── ModernDashboardComp.jsx
│   │   ├── ModernDashComments.jsx
│   │   ├── ModernDashPosts.jsx
│   │   ├── ModernDashProfile.jsx
│   │   ├── ModernDashSidebar.jsx
│   │   ├── ModernDashUsers.jsx
│   │   ├── ModernPostCard.jsx
│   │   ├── ModernUserPanel.jsx
│   │   ├── OAuth.jsx
│   │   ├── Portal.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── SmoothScrollbar.jsx
│   │   └── ThemeProvider.jsx
│   ├── config/
│   │   └── env.js
│   ├── firebase.js
│   ├── index.css
│   ├── main.jsx
│   ├── pages/
│   │   ├── ModernAbout.jsx
│   │   ├── ModernCreatePost.jsx
│   │   ├── ModernDashboard.jsx
│   │   ├── ModernHome.jsx
│   │   ├── ModernPostPage.jsx
│   │   ├── ModernProjects.jsx
│   │   ├── ModernSearch.jsx
│   │   ├── ModernSignIn.jsx
│   │   ├── ModernSignUp.jsx
│   │   └── UpdatePost.jsx
│   ├── redux/
│   │   ├── store.js
│   │   ├── theme/
│   │   │   └── themeSlice.js
│   │   └── user/
│   │       └── userSlice.js
│   └── utils/
│       ├── debug.js
│       └── errorHandler.js
├── tailwind.config.js
├── vite.config.js
└── website_background.png
```

## 5. Coding Guidelines

All code should adhere to the following guidelines to ensure consistency, readability, and maintainability.

### 5.1. General Principles

- **Clean Code:** Follow the principles of clean code, such as meaningful names, small functions, and clear comments.
- **DRY (Don't Repeat Yourself):** Avoid code duplication by creating reusable functions and components.
- **KISS (Keep It Simple, Stupid):** Write simple, straightforward code that is easy to understand.

### 5.2. Frontend

- **Component Naming:** Use PascalCase for React components (e.g., `MyComponent`).
- **File Naming:** Use kebab-case for file names (e.g., `my-component.jsx`).
- **Styling:** Use Tailwind CSS for styling and avoid writing custom CSS where possible.

### 5.3. Backend

- **API Endpoints:** Use kebab-case for API endpoints (e.g., `/api/users/:id`).
- **Error Handling:** Use a centralized error handling middleware to handle errors consistently.
- **Security:** Implement proper security measures, such as input validation and authentication, for all API endpoints.

## 6. Getting Started

### 6.1. Prerequisites

- Node.js
- npm
- MongoDB

### 6.2. Installation

1. Clone the repository.
2. Install dependencies for the backend: `cd Blog/api && npm install`.
3. Install dependencies for the frontend: `cd Blog/client && npm install`.

### 6.3. Running the Application

1. Start the backend server: `cd Blog/api && npm start`.
2. Start the frontend development server: `cd Blog/client && npm run dev`.

This blueprint should provide a solid foundation for any developer or AI agent to start working on the project. 