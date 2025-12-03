# 📦 Subscription Tracker API

A robust REST API for managing subscription services with automated renewal reminders via email. Built with Node.js, Express, MongoDB, and integrated with Upstash QStash for workflow automation.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Run with Docker (Recommended)](#-run-with-docker-recommended)
  - [Run with npm](#-run-with-npm)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing the API](#-testing-the-api)
  - [Using cURL](#using-curl)
  - [Using Thunder Client (VS Code)](#using-thunder-client-vs-code)
  - [Using Postman](#using-postman)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- 🔐 **User Authentication** - Sign up, sign in, sign out with JWT tokens
- 📝 **Subscription Management** - Create, read, update, delete subscriptions
- 📧 **Email Reminders** - Automated renewal reminders at 7, 5, 2, and 1 day(s) before renewal
- 🛡️ **Rate Limiting** - Protection against abuse using Arcjet
- 🤖 **Bot Detection** - Blocks malicious bots while allowing search engines
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SUBSCRIPTION TRACKER API                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                     │
│  │   Client     │────▶│   Express    │────▶│  Middleware  │                     │
│  │  (Browser/   │     │   Server     │     │  - Auth      │                     │
│  │   Mobile)    │     │  Port 5500   │     │  - Arcjet    │                     │
│  └──────────────┘     └──────────────┘     │  - Error     │                     │
│                              │              └──────┬───────┘                     │
│                              │                     │                             │
│                              ▼                     ▼                             │
│                       ┌──────────────────────────────────────┐                  │
│                       │              ROUTES                   │                  │
│                       ├──────────┬──────────┬────────────────┤                  │
│                       │  Auth    │  Users   │  Subscriptions │                  │
│                       │ /api/v1/ │ /api/v1/ │    /api/v1/    │                  │
│                       │  auth    │  users   │  subscriptions │                  │
│                       └────┬─────┴────┬─────┴───────┬────────┘                  │
│                            │          │             │                            │
│                            ▼          ▼             ▼                            │
│                       ┌──────────────────────────────────────┐                  │
│                       │           CONTROLLERS                 │                  │
│                       │  - auth.controller.js                 │                  │
│                       │  - user.controller.js                 │                  │
│                       │  - subscription.controller.js         │                  │
│                       │  - workflow.controller.js             │                  │
│                       └──────────────────┬───────────────────┘                  │
│                                          │                                       │
│              ┌───────────────────────────┼───────────────────────────┐          │
│              │                           │                           │          │
│              ▼                           ▼                           ▼          │
│     ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      │
│     │    MongoDB      │      │  Upstash QStash │      │   Nodemailer    │      │
│     │   (Database)    │      │   (Workflows)   │      │    (Email)      │      │
│     │                 │      │                 │      │                 │      │
│     │  ┌───────────┐  │      │  Scheduled      │      │  Gmail SMTP     │      │
│     │  │   Users   │  │      │  Reminders:     │      │                 │      │
│     │  └───────────┘  │      │  - 7 days       │      │  Sends renewal  │      │
│     │  ┌───────────┐  │      │  - 5 days       │      │  reminder       │      │
│     │  │Subscrip-  │  │      │  - 2 days       │      │  emails         │      │
│     │  │  tions    │  │      │  - 1 day        │      │                 │      │
│     │  └───────────┘  │      │                 │      │                 │      │
│     └─────────────────┘      └─────────────────┘      └─────────────────┘      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
┌─────────┐    HTTP Request    ┌─────────────┐    ┌────────────┐    ┌────────────┐
│ Client  │ ─────────────────▶ │   Express   │───▶│  Arcjet    │───▶│   Auth     │
└─────────┘                    │   Server    │    │ Middleware │    │ Middleware │
                               └─────────────┘    └────────────┘    └─────┬──────┘
                                                                          │
    ┌─────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   Route    │───▶│ Controller │───▶│   Model    │───▶│  MongoDB   │
│  Handler   │    │   Logic    │    │  (Mongoose)│    │  Database  │
└────────────┘    └─────┬──────┘    └────────────┘    └────────────┘
                        │
                        │ (On subscription create)
                        ▼
                  ┌────────────┐    ┌────────────┐    ┌────────────┐
                  │  Upstash   │───▶│  Workflow  │───▶│ Nodemailer │
                  │   QStash   │    │  Scheduler │    │   Email    │
                  └────────────┘    └────────────┘    └────────────┘
```

### Email Reminder Workflow

```
Subscription Created
        │
        ▼
┌───────────────────┐
│  QStash Workflow  │
│     Triggered     │
└────────┬──────────┘
         │
         ▼
    ┌────────────────────────────────────────────┐
    │           REMINDER SCHEDULE                 │
    ├────────────────────────────────────────────┤
    │                                            │
    │   Renewal Date: Dec 31, 2025               │
    │                                            │
    │   📧 Dec 24 ─── 7 days before reminder     │
    │   📧 Dec 26 ─── 5 days before reminder     │
    │   📧 Dec 29 ─── 2 days before reminder     │
    │   📧 Dec 30 ─── 1 day before reminder      │
    │                                            │
    └────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Upstash QStash** | Workflow automation |
| **Nodemailer** | Email sending |
| **Arcjet** | Rate limiting & bot protection |
| **Docker** | Containerization |

---

## 📋 Prerequisites

- **Node.js** v20+ (or Docker)
- **MongoDB** (Atlas or local)
- **Upstash Account** (for QStash workflows)
- **Gmail Account** (for sending emails with App Password)
- **Arcjet Account** (for rate limiting)

---

## 🚀 Installation

### 🐳 Run with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/shishirshetty77/subscription-tracker-backend.git
   cd subscription-tracker-backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.development.local
   # Edit .env.development.local with your values
   ```

3. **Start with Docker Compose**
   ```bash
   docker compose up -d --build
   ```

4. **Check logs**
   ```bash
   docker compose logs -f
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:5500/
   # Expected: "welcome to the subscription tracker api"
   ```

#### Docker Commands Reference

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f

# Restart containers
docker compose restart

# Check container status
docker compose ps
```

---

### 📦 Run with npm

1. **Clone the repository**
   ```bash
   git clone https://github.com/shishirshetty77/subscription-tracker-backend.git
   cd subscription-tracker-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.development.local
   # Edit .env.development.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Start production server**
   ```bash
   npm start
   ```

> ⚠️ **Note**: If using Node.js v25+, you may encounter compatibility issues. Use Node.js v20 LTS or run with Docker.

---

## 🔐 Environment Variables

Create a `.env.development.local` file in the root directory:

```env
# Server
PORT=5500
NODE_ENV=development
SERVER_URL=http://localhost:5500

# Database
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/subscription-tracker

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=1d

# Arcjet (Rate Limiting)
ARCJET_KEY=ajkey_your_arcjet_key

# Upstash QStash (Workflows)
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_qstash_token

# Email (Gmail)
EMAIL_PASSWORD=your_gmail_app_password
```

### Getting API Keys

| Service | How to Get |
|---------|------------|
| **MongoDB Atlas** | [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create cluster → Get connection string |
| **Arcjet** | [arcjet.com](https://arcjet.com) → Sign up → Get API key |
| **Upstash QStash** | [upstash.com](https://upstash.com) → Create QStash → Get token |
| **Gmail App Password** | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Generate app password |

---

## 📚 API Documentation

### Base URL
```
http://localhost:5500/api/v1
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/sign-up` | Register new user | ❌ |
| POST | `/auth/sign-in` | Login user | ❌ |
| POST | `/auth/sign-out` | Logout user | ❌ |

#### 👤 Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ❌ |
| GET | `/users/:id` | Get user by ID | ✅ |

#### 📦 Subscriptions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subscriptions` | Get all subscriptions | ❌ |
| GET | `/subscriptions/:id` | Get subscription by ID | ❌ |
| POST | `/subscriptions` | Create subscription | ✅ |
| PUT | `/subscriptions/:id` | Update subscription | ✅ |
| DELETE | `/subscriptions/:id` | Delete subscription | ✅ |
| GET | `/subscriptions/user/:id` | Get user's subscriptions | ✅ |
| PUT | `/subscriptions/:id/cancel` | Cancel subscription | ✅ |

### Request/Response Examples

#### Sign Up
```json
// POST /api/v1/auth/sign-up
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response (201 Created)
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Create Subscription
```json
// POST /api/v1/subscriptions
// Headers: Authorization: Bearer <token>
// Request Body
{
  "name": "Netflix",
  "price": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "Credit Card",
  "startDate": "2025-12-01"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "subscription": {
      "_id": "...",
      "name": "Netflix",
      "price": 15.99,
      "renewalDate": "2025-12-31T00:00:00.000Z",
      "status": "active"
    },
    "workflowRunId": "..."
  }
}
```

---

## 🧪 Testing the API

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:5500/
```

#### 2. Sign Up
```bash
curl -X POST http://localhost:5500/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Sign In
```bash
curl -X POST http://localhost:5500/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 4. Create Subscription (Protected)
```bash
# Replace YOUR_TOKEN with the token from sign-in response
TOKEN="YOUR_TOKEN"

curl -X POST http://localhost:5500/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Netflix",
    "price": 15.99,
    "currency": "USD",
    "frequency": "monthly",
    "category": "entertainment",
    "paymentMethod": "Credit Card",
    "startDate": "2025-12-01"
  }'
```

#### 5. Get User Subscriptions
```bash
# Replace YOUR_TOKEN and USER_ID
curl http://localhost:5500/api/v1/subscriptions/user/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. Get All Users
```bash
curl http://localhost:5500/api/v1/users
```

---

### Using Thunder Client (VS Code)

Thunder Client is a lightweight REST API client extension for VS Code.

#### Installation

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` on Mac, `Ctrl+Shift+X` on Windows)
3. Search for "Thunder Client"
4. Click Install

#### Setup

1. Click the Thunder Client icon in the sidebar (lightning bolt ⚡)
2. Click "New Request"

#### Testing Endpoints

##### Test 1: Health Check
```
Method: GET
URL: http://localhost:5500/
```
Click "Send" → Should see: `welcome to the subscription tracker api`

##### Test 2: Sign Up
```
Method: POST
URL: http://localhost:5500/api/v1/auth/sign-up
Headers:
  Content-Type: application/json
Body (JSON):
{
  "name": "Thunder User",
  "email": "thunder@example.com",
  "password": "password123"
}
```

##### Test 3: Sign In
```
Method: POST
URL: http://localhost:5500/api/v1/auth/sign-in
Headers:
  Content-Type: application/json
Body (JSON):
{
  "email": "thunder@example.com",
  "password": "password123"
}
```
📋 **Copy the `token` from the response!**

##### Test 4: Create Subscription (Protected)
```
Method: POST
URL: http://localhost:5500/api/v1/subscriptions
Headers:
  Content-Type: application/json
  Authorization: Bearer <paste_your_token_here>
Body (JSON):
{
  "name": "Spotify",
  "price": 9.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "Credit Card",
  "startDate": "2025-12-01"
}
```

##### Test 5: Get User Subscriptions
```
Method: GET
URL: http://localhost:5500/api/v1/subscriptions/user/<user_id>
Headers:
  Authorization: Bearer <your_token>
```

#### Thunder Client Environment Variables (Pro Tip)

1. Go to Thunder Client → Env
2. Create new environment: "Local"
3. Add variables:
   ```
   baseUrl = http://localhost:5500/api/v1
   token = <your_jwt_token>
   userId = <your_user_id>
   ```
4. Use in requests:
   - URL: `{{baseUrl}}/subscriptions`
   - Header: `Authorization: Bearer {{token}}`

---

### Using Postman

#### Import Collection

1. Open Postman
2. Click "Import"
3. Create requests manually or use cURL import

#### Environment Setup

1. Go to Environments → Create "Local"
2. Add variables:
   | Variable | Initial Value | Current Value |
   |----------|---------------|---------------|
   | baseUrl | http://localhost:5500/api/v1 | http://localhost:5500/api/v1 |
   | token | | (fill after login) |
   | userId | | (fill after login) |

3. Use `{{baseUrl}}` in your request URLs
4. Use `{{token}}` in Authorization header

---

## 📁 Project Structure

```
subscription-tracker/
├── app.js                    # Express app entry point
├── package.json              # Dependencies and scripts
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Docker Compose orchestration
├── .dockerignore             # Docker ignore patterns
├── .gitignore                # Git ignore patterns
├── .env.development.local    # Environment variables (not in git)
│
├── config/
│   ├── env.js                # Environment variable exports
│   ├── arcjet.js             # Arcjet rate limiting config
│   ├── nodemailer.js         # Email transporter config
│   └── upstash.js            # QStash workflow client
│
├── controllers/
│   ├── auth.controller.js    # Authentication logic
│   ├── user.controller.js    # User CRUD operations
│   ├── subscription.controller.js  # Subscription operations
│   └── workflow.controller.js      # Email reminder workflows
│
├── database/
│   └── mongodb.js            # MongoDB connection
│
├── middlewares/
│   ├── auth.middleware.js    # JWT verification
│   ├── arcjet.middleware.js  # Rate limiting & bot protection
│   └── error.middleware.js   # Global error handler
│
├── models/
│   ├── user.model.js         # User schema
│   └── subscription.model.js # Subscription schema
│
├── routes/
│   ├── auth.routes.js        # /api/v1/auth routes
│   ├── user.routes.js        # /api/v1/users routes
│   ├── subscription.routes.js # /api/v1/subscriptions routes
│   └── workflow.routes.js    # /api/v1/workflows routes
│
└── utils/
    ├── send-email.js         # Email sending utility
    └── email-template.js     # HTML email templates
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Cannot read properties of undefined (reading 'prototype')"
**Cause**: Node.js v25+ incompatibility with `jsonwebtoken`
**Solution**: Use Node.js v20 LTS or run with Docker

#### 2. "ECONNREFUSED" on MongoDB
**Cause**: MongoDB not running or wrong connection string
**Solution**: 
- Check `DB_URL` in `.env.development.local`
- Whitelist your IP in MongoDB Atlas

#### 3. "Unauthorized" on protected routes
**Cause**: Missing or invalid JWT token
**Solution**: 
- Include `Authorization: Bearer <token>` header
- Get a fresh token from `/auth/sign-in`

#### 4. "Rate limit exceeded"
**Cause**: Arcjet rate limiting triggered
**Solution**: Wait 10 seconds or adjust rate limits in `config/arcjet.js`

#### 5. QStash workflow fails with "loopback address"
**Cause**: QStash can't reach `localhost`
**Solution**: 
- For local dev: Use ngrok (`ngrok http 5500`)
- For production: Set `SERVER_URL` to public domain

#### 6. Port already in use
**Solution**:
```bash
# Find process using port 5500
lsof -ti:5500

# Kill it
lsof -ti:5500 | xargs kill -9
```

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by [Shishir Shetty](https://github.com/shishirshetty77)
