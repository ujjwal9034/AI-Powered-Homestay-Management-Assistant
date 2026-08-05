# 🏠 StayWise — AI-Powered Homestay Management Assistant

An AI-powered platform that helps homestay owners manage guest reviews, customer queries, and tourist assistance.

## 🔗 Live Demo

**Frontend**: [https://staywise-kappa.vercel.app](https://staywise-kappa.vercel.app)

**Backend Health**: [https://staywise-kappa.vercel.app/api/health](https://staywise-kappa.vercel.app/api/health)

**GitHub Repository**: [https://github.com/ujjwal9034/AI-Powered-Homestay-Management-Assistant](https://github.com/ujjwal9034/AI-Powered-Homestay-Management-Assistant)

---

## 📸 Screenshots

| Homepage — Hero | Explore Homestays |
|:---:|:---:|
| ![Homepage Hero](docs/screenshots/homepage-hero.png) | ![Explore Homestays](docs/screenshots/explore-homestays.png) |

| Featured Listings | About StayWise |
|:---:|:---:|
| ![Featured Listings](docs/screenshots/homepage-featured.png) | ![About Page](docs/screenshots/about-page.png) |

---

## 🎬 Demo Video

> _Demo video will be added here once recorded and uploaded._

<!-- Replace the line above with an embedded link once available:
[![Watch Demo](https://img.shields.io/badge/Watch-Demo_Video-red?style=for-the-badge&logo=youtube)](YOUR_VIDEO_LINK)
-->

---

## Tech Stack Summary

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens), Google OAuth 2.0, Passport.js
- **AI Services**: Google Gemini API (`@google/generative-ai`)
- **Deployment Platforms**: Vercel (Frontend & Serverless Functions)

## Features

- 🏠 Homestay Listings (Create, Edit, Delete — Owner/Admin)
- 🔍 Explore Page with Filters & Sort
- ⭐ Review Management (Role-based CRUD via REST API)
- 🔐 JWT Authentication & Google OAuth 2.0
- 🛡️ Protected Routes (frontend & backend)
- 👥 Multi-Role System (Customer, Owner, Admin)
- 📆 Booking & Checkout with Bill Calculator
- 💳 Payment Gateway Integration (Simulated)
- ⏱️ Rate Limiting on auth endpoints
- ✅ Input Validation (express-validator)
- 🤖 AI Review Reply Suggestions (Gemini)
- 🗺️ AI Local Tourist Guide Chatbot
- ✍️ AI Property Description Enhancer
- 📊 AI Host Analytics & Sentiment Insights
- 💰 AI Dynamic Pricing Recommendations
- 📩 AI Booking Messages (Check-in/Check-out)
- 🧳 AI Trip Planner
- 🔎 AI Smart Search (Natural Language)
- 🌙 Dark / Light Theme Toggle
- 📱 Fully Responsive Design
- 🗄️ MongoDB Atlas Database Integration

---

## AI Features (Google Gemini API)

StayWise integrates **8 AI-powered features** using the Google Gemini API (`@google/generative-ai`):

| # | Feature | Description | Endpoint / Location |
|---|---------|-------------|---------------------|
| 1 | **AI Review Reply Suggestions** | Generates context-aware replies to guest reviews based on rating and sentiment | `POST /api/reviews/:id/reply` |
| 2 | **AI Local Tourist Guide Chatbot** | Interactive conversational chatbot that acts as a local guide for each homestay | `POST /api/homestays/:id/chat` |
| 3 | **AI Property Description Enhancer** | Generates compelling property descriptions from name, location, and amenities | `POST /api/homestays/enhance` |
| 4 | **AI Host Analytics & Sentiment Insights** | Summarizes review sentiment and provides actionable insights for hosts | `GET /api/homestays/owner/analytics` |
| 5 | **AI Dynamic Pricing Recommendations** | Suggests pricing based on occupancy rate and seasonality | `POST /api/homestays/:id/suggest-price` |
| 6 | **AI Booking Messages** | Auto-generates personalized check-in and check-out messages for guests | Used in booking flow |
| 7 | **AI Trip Planner** | Creates personalized multi-day travel itineraries with budget and style preferences | `POST /api/ai/trip-planner` |
| 8 | **AI Smart Search** | Parses natural language queries into structured filters for homestay search | `POST /api/homestays/smart-search` |

All AI features include retry logic with exponential backoff and graceful error handling when the API quota is exceeded.

---

## Database Used

**MongoDB Atlas** — A cloud-hosted NoSQL database service by MongoDB.

All review data is stored in a MongoDB Atlas cluster and accessed via the **Mongoose** ODM (Object Data Modeling) library.

## Why MongoDB

| Reason                    | Explanation                                                                         |
|---------------------------|------------------------------------------------------------------------------------|
| **JSON-native**           | MongoDB stores data as BSON (Binary JSON), which maps naturally to JavaScript objects |
| **Flexible Schema**       | Reviews can evolve over time without rigid table migrations                          |
| **MERN Stack Standard**   | MongoDB is the "M" in MERN — ideal pairing with Express, React, and Node.js         |
| **Cloud-hosted (Atlas)**  | No local database setup needed; accessible from anywhere                            |
| **Mongoose ODM**          | Provides schema validation, middleware, and query building out of the box            |
| **Beginner-friendly**     | Widely taught, excellent documentation, and large community support                  |

## Schemas

### Review Model (`backend/models/Review.js`)

| Field          | Type     | Required | Default      | Validation                      |
|----------------|----------|----------|--------------|---------------------------------|
| `guest`        | String   | ✅ Yes   | —            | Trimmed                         |
| `platform`     | String   | ✅ Yes   | —            | Trimmed                         |
| `rating`       | Number   | ✅ Yes   | —            | Min: 1, Max: 5                  |
| `text`         | String   | ✅ Yes   | —            | Trimmed                         |
| `date`         | String   | No       | `"Just now"` | —                               |
| `status`       | String   | No       | `"pending"`  | Enum: pending, replied, flagged |
| `aiSuggestion` | String   | No       | `null`       | —                               |
| `createdAt`    | Date     | No       | `Date.now`   | Auto-generated                  |
| `updatedAt`    | Date     | No       | Auto         | Managed by Mongoose timestamps  |

### User Model (`backend/models/User.js`)

| Field        | Type     | Required | Default   | Validation                         |
|--------------|----------|----------|-----------|-------------------------------------|
| `name`       | String   | ✅ Yes   | —         | Trimmed                            |
| `email`      | String   | ✅ Yes   | —         | Unique, lowercase, valid email     |
| `password`   | String   | No*      | —         | Min 6 chars, hashed with bcrypt    |
| `role`       | String   | No       | `"owner"` | Enum: owner, admin                 |
| `googleId`   | String   | No       | `null`    | For Google OAuth users             |
| `avatar`     | String   | No       | `null`    | Google profile picture URL         |
| `createdAt`  | Date     | No       | Auto      | Auto-generated by Mongoose         |
| `updatedAt`  | Date     | No       | Auto      | Managed by Mongoose timestamps     |

> \* Password is not required for Google OAuth users — they authenticate via Google instead.

### Homestay Model (`backend/models/Homestay.js`)

| Field          | Type       | Required | Default | Validation                     |
|----------------|------------|----------|---------|--------------------------------|
| `name`         | String     | ✅ Yes   | —       | Trimmed                        |
| `location`     | String     | ✅ Yes   | —       | Trimmed                        |
| `description`  | String     | No       | `""`    | Trimmed                        |
| `owner`        | ObjectId   | ✅ Yes   | —       | Ref: User                      |
| `amenities`    | [String]   | No       | `[]`    | —                              |
| `pricePerNight`| Number     | No       | `0`     | Min: 0                         |
| `image`        | String     | No       | `null`  | —                              |
| `rating`       | Number     | No       | `0`     | Min: 0, Max: 5                 |
| `totalReviews` | Number     | No       | `0`     | —                              |

### Booking Model (`backend/models/Booking.js`)

| Field           | Type       | Required | Default       | Validation                                            |
|-----------------|------------|----------|---------------|-------------------------------------------------------|
| `customer`      | ObjectId   | ✅ Yes   | —             | Ref: User                                             |
| `homestay`      | ObjectId   | ✅ Yes   | —             | Ref: Homestay                                         |
| `checkIn`       | Date       | ✅ Yes   | —             | —                                                     |
| `checkOut`      | Date       | ✅ Yes   | —             | —                                                     |
| `guestsCount`   | Number     | No       | `1`           | Min: 1                                                |
| `nights`        | Number     | ✅ Yes   | —             | Min: 1                                                |
| `basePrice`     | Number     | ✅ Yes   | —             | —                                                     |
| `serviceFee`    | Number     | ✅ Yes   | —             | —                                                     |
| `tax`           | Number     | ✅ Yes   | —             | —                                                     |
| `totalPrice`    | Number     | ✅ Yes   | —             | —                                                     |
| `status`        | String     | No       | `"confirmed"` | Enum: pending, confirmed, cancelled                   |
| `paymentStatus` | String     | No       | `"pending"`   | Enum: pending, paid, failed, refunded                 |
| `paymentMethod` | String     | No       | `"card"`      | Enum: card, upi, netbanking, stripe, razorpay, simulated |

---

## Project Structure

```
AI-Powered-Homestay-Management-Assistant/
├── api/
│   └── index.js               # Vercel serverless entry point
├── backend/
│   ├── config/                 # Configuration files
│   │   ├── db.js               # MongoDB connection logic
│   │   ├── gemini.js           # Google Gemini AI integration (8 features)
│   │   └── passport.js         # Passport Google OAuth strategy
│   ├── controllers/            # Route handler logic
│   │   ├── adminController.js
│   │   ├── aiController.js     # AI Trip Planner
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── healthController.js
│   │   ├── homestayController.js  # Homestay CRUD + AI features
│   │   ├── paymentController.js
│   │   └── reviewController.js    # Review CRUD + AI reply
│   ├── data/                   # Static seed data (JSON)
│   │   └── reviews.json
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT verification (protect)
│   │   ├── authorize.js       # Role-based authorization
│   │   ├── errorHandler.js    # Global error handler
│   │   ├── rateLimiter.js     # Rate limiting (express-rate-limit)
│   │   ├── requestLogger.js
│   │   └── validators.js      # Input validation (express-validator)
│   ├── models/                # Mongoose schemas/models
│   │   ├── Booking.js
│   │   ├── Homestay.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/                # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── homestayRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── uploadRoutes.js
│   ├── uploads/               # Local image uploads directory
│   ├── .env.example           # Environment variable template
│   ├── package.json
│   ├── seed.js                # Database seeder script
│   └── server.js              # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── FeatureCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReceiptModal.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── TripPlannerModal.jsx
│   │   │   └── ui/            # UI primitives (Button, Input, Modal, Toast, Loader)
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useDocumentTitle.js
│   │   ├── pages/             # Page components
│   │   │   ├── About.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── ComponentsDemo.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── Dashboard.jsx       # Role-based dashboard router
│   │   │   ├── Explore.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── HomestayDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── OAuthCallback.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   └── Profile.jsx
│   │   └── services/          # API service layer (Axios)
│   │       └── api.js
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── screenshots/           # README screenshots
│   ├── review_schema_diagram.html
│   └── review_schema_diagram.svg
├── PROMPTS.md                 # Week 7 AI prompt log
├── vercel.json                # Vercel deployment config
├── package.json
└── README.md
```

---

## Authentication System (Week 6)

### JWT (JSON Web Token) Authentication

StayWise uses **JWT tokens** for stateless authentication:

1. **Registration/Login**: When a user registers or logs in, the server generates a JWT token containing the user's ID.
2. **Token Storage**: The token is stored in the browser's `localStorage` under `staywise-user`.
3. **Automatic Attachment**: An Axios interceptor automatically attaches the token as a `Bearer` token in the `Authorization` header of every API request.
4. **Token Verification**: On each app load, the frontend calls `GET /api/auth/me` to verify the token is still valid.
5. **Expiration**: Tokens expire after 7 days (configurable via `JWT_EXPIRE` in `.env`).

```
Client                          Server
  │                                │
  ├── POST /api/auth/login ───────►│
  │   { email, password }          │  ── Verify credentials
  │                                │  ── Generate JWT
  │◄── { token, user } ───────────│
  │                                │
  │── GET /api/auth/me ──────────►│
  │   Authorization: Bearer <JWT>  │  ── Verify JWT
  │                                │  ── Find user by ID
  │◄── { user data } ─────────────│
  │                                │
```

### Protected Routes

#### Backend
- Routes protected with the `protect` middleware return **401 Unauthorized** when:
  - No token is provided
  - The token is invalid or expired
  - The user no longer exists

#### Frontend
- The `ProtectedRoute` component wraps routes that require authentication:
  - `/dashboard` — Main management view
  - `/profile` — User profile page
  - `/checkout` — Booking checkout
  - `/payment-success` — Payment confirmation
- Unauthenticated users are **automatically redirected** to `/login`
- A loading spinner shows while authentication state is being verified

### Google OAuth 2.0 Setup

To enable **Sign in with Google**:

#### Step 1 — Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web application type)
3. Add these Authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback`
4. Add these Authorized JavaScript origins:
   - `http://localhost:5173`
5. Copy the **Client ID** and **Client Secret**

#### Step 2 — Configure Environment Variables

Add the credentials to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

#### OAuth Flow

```
User clicks "Sign in with Google"
  │
  ├── Redirected to Google consent screen
  │
  ├── Google redirects back to /api/auth/google/callback
  │
  ├── Server finds or creates user in MongoDB
  │
  ├── Server generates JWT and redirects to /auth/callback?token=<JWT>
  │
  └── Frontend stores token and redirects to /dashboard
```

> **Note**: The app works fully without Google OAuth configured. Email/password authentication is always available.

### Rate Limiting

Authentication endpoints are protected with **express-rate-limit**:

| Endpoint               | Limit                    | Response on Exceed |
|------------------------|--------------------------|-------------------|
| `POST /api/auth/login`    | 10 requests / 15 minutes | `429 Too Many Requests` |
| `POST /api/auth/register` | 10 requests / 15 minutes | `429 Too Many Requests` |

### Input Validation

All authentication inputs are validated using **express-validator**:

| Field      | Validation Rules                                   |
|------------|---------------------------------------------------|
| `name`     | Required (register only), trimmed                  |
| `email`    | Required, must be valid email format, normalized   |
| `password` | Required, minimum 6 characters                     |

Invalid requests return **400 Bad Request** with structured error messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

## Database Setup

### Step 1 — Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up (free).
2. Create a new **Cluster** (the free M0 tier works fine).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
5. Click **Connect** → **Connect your application** → Copy the connection string.

### Step 2 — Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and replace the placeholder with your actual connection string:

```env
PORT=5001
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/staywise?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

> **⚠️ Important:** Replace `yourUsername`, `yourPassword`, and the cluster URL with your actual Atlas credentials. Never commit the `.env` file to Git.

### Step 3 — Seed the Database (Optional)

To populate MongoDB with the sample review data:

```bash
cd backend
node seed.js
```

To clear all reviews from the database:

```bash
node seed.js --clear
```

---

## Running Backend

```bash
cd backend
npm install                 # Install dependencies (includes mongoose)
cp .env.example .env        # Create environment file (then edit with your MONGO_URI)
node seed.js                # (Optional) Seed database with sample data
npm run dev                 # Start with auto-reload (nodemon)
# or
npm start                   # Start without auto-reload
```

### Expected Console Output

```
✅ MongoDB Connected: cluster0-shard-00-02.xxxxx.mongodb.net
📦 Database Name:    staywise

✅ Google OAuth strategy registered

🏠 StayWise API server running on http://localhost:5001
📋 Health check:  http://localhost:5001/api/health
⭐ Reviews API:   http://localhost:5001/api/reviews
🔐 Auth API:      http://localhost:5001/api/auth
```

If the connection fails, you'll see:

```
❌ MongoDB Connection Failed: <error details>
```

---

## How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- npm (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)
- A [Google Gemini API Key](https://aistudio.google.com/apikey) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/ujjwal9034/AI-Powered-Homestay-Management-Assistant.git
cd AI-Powered-Homestay-Management-Assistant
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env        # Create environment file
# Edit .env and add your MONGO_URI, JWT_SECRET, GEMINI_API_KEY, and optionally Google OAuth credentials
npm install                 # Install dependencies
node seed.js                # Seed database with sample reviews
npm run dev                 # Start with auto-reload (nodemon)
```

The API server will start at **http://localhost:5001**.

#### Available API Endpoints

| Method   | Endpoint                    | Auth     | Description                |
|----------|-----------------------------|----------|----------------------------|
| `GET`    | `/api/health`               | Public   | Server health check        |
| `POST`   | `/api/auth/register`        | Public   | Register a new user        |
| `POST`   | `/api/auth/login`           | Public   | Login with credentials     |
| `POST`   | `/api/auth/logout`          | Protected| Logout current user        |
| `GET`    | `/api/auth/me`              | Protected| Get current user profile   |
| `GET`    | `/api/auth/google`          | Public   | Initiate Google OAuth      |
| `GET`    | `/api/auth/google/callback` | Public   | Google OAuth callback      |
| `GET`    | `/api/reviews`              | Public   | Get all reviews            |
| `GET`    | `/api/reviews/:id`          | Public   | Get review by ID           |
| `POST`   | `/api/reviews`              | Protected| Create a new review        |
| `PUT`    | `/api/reviews/:id`          | Protected| Full update a review       |
| `PATCH`  | `/api/reviews/:id`          | Protected| Partial update a review    |
| `DELETE` | `/api/reviews/:id`          | Protected| Delete a review            |
| `GET`    | `/api/homestays`            | Public   | List all homestays         |
| `GET`    | `/api/homestays/:id`        | Public   | Get homestay details       |
| `POST`   | `/api/homestays`            | Protected| Create a homestay (Owner)  |
| `PUT`    | `/api/homestays/:id`        | Protected| Update a homestay (Owner)  |
| `DELETE` | `/api/homestays/:id`        | Protected| Delete a homestay (Owner)  |
| `POST`   | `/api/homestays/:id/chat`   | Public   | AI Tourist Guide Chatbot   |
| `POST`   | `/api/homestays/enhance`    | Protected| AI Description Enhancer    |
| `POST`   | `/api/homestays/smart-search`| Public  | AI Smart Search            |
| `POST`   | `/api/ai/trip-planner`      | Protected| AI Trip Planner            |
| `POST`   | `/api/bookings`             | Protected| Create a booking           |
| `GET`    | `/api/bookings/mine`        | Protected| Get user's bookings        |

### 3. Start the Frontend

```bash
cd frontend
npm install                 # Install dependencies
npm run dev                 # Start Vite dev server
```

The frontend will start at **http://localhost:5173** and automatically proxy API requests to the backend.

> **Note:** Make sure the backend is running before starting the frontend so the Dashboard can fetch live review data.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Default                        | Description                          |
|------------------------|--------------------------------|--------------------------------------|
| `PORT`                 | `5001`                         | API server port                      |
| `MONGO_URI`            | —                              | MongoDB Atlas connection string      |
| `JWT_SECRET`           | —                              | Secret key for signing JWT tokens    |
| `JWT_EXPIRE`           | `7d`                           | JWT token expiration time            |
| `GEMINI_API_KEY`       | —                              | Google Gemini API key for AI features|
| `GOOGLE_CLIENT_ID`     | —                              | Google OAuth 2.0 Client ID           |
| `GOOGLE_CLIENT_SECRET` | —                              | Google OAuth 2.0 Client Secret       |
| `GOOGLE_CALLBACK_URL`  | `http://localhost:5001/api/auth/google/callback` | OAuth callback URL |
| `FRONTEND_URL`         | `http://localhost:5173`        | Frontend URL for OAuth redirects     |

### `backend/.env.example`

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/staywise?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

> **⚠️ Security:** Never commit your `.env` file. Only `.env.example` (with placeholder values) should be tracked in Git.

---

## Deployment

StayWise is deployed on **Vercel** as a monorepo:

- **Frontend**: Built as a static site using `@vercel/static-build` (Vite)
- **Backend**: Deployed as a Vercel Serverless Function via `api/index.js`
- **Database**: MongoDB Atlas (cloud-hosted, accessible from Vercel)

Configuration is defined in [`vercel.json`](vercel.json).

---

## Known Limitations (Free Tier)

- **Serverless Cold Starts**: Initial requests to Vercel Serverless Functions after inactivity may experience a slight cold start delay.
- **Serverless Execution Timeouts**: Vercel free tier serverless function invocations have execution time limits per request.
- **MongoDB Atlas Free Tier (M0)**: Shared database cluster has connection pool and storage limits under heavy traffic.
- **AI API Quotas & Availability**: AI features (Trip Planner, Review Replies, Concierge Chatbot) depend on Google Gemini API availability and quota limits.

---

## Weekly Progress

- **Week 2:** Frontend skeleton completed (React + Vite + Tailwind)
- **Week 4:** Backend & API development (Express.js REST API with mock data, frontend integration via Axios)
- **Week 5:** Database integration (MongoDB Atlas + Mongoose, schema validation, all CRUD endpoints connected to real database)
- **Week 6:** Authentication system (JWT authentication, Google OAuth 2.0, rate limiting with express-rate-limit, input validation with express-validator, protected routes, Profile page)
- **Week 7:** AI integration (Google Gemini API — Review Reply Suggestions, Tourist Guide Chatbot, Trip Planner, Property Description Enhancer, Host Analytics); AI prompt engineering documented in `PROMPTS.md`
- **Week 8:** Full frontend integration and multi-role system (Customer, Owner, Admin dashboards; Homestay CRUD; Booking & Checkout; Payment flow; AI Smart Search; Dynamic Pricing)
- **Week 9:** Vercel deployment (monorepo — static frontend + serverless backend); live deployment testing and bug fixes; README documentation overhaul
- **Week 10:** Final capstone submission — README polished with screenshots, demo video placeholder, complete AI feature documentation, updated project structure

---

## Future Scope

- 🔔 Real-time push notifications for booking confirmations and review alerts
- 💬 WebSocket-based live chat between guests and hosts
- 🌐 Multi-language support for international tourists
- 📊 Advanced analytics dashboard with revenue forecasting
- 🗺️ Map integration (Google Maps / Mapbox) for homestay locations
- 📱 Progressive Web App (PWA) support for mobile
- 🔍 Image-based search using AI vision models
- 💳 Production payment gateway (Stripe / Razorpay) integration
- 📧 Email notifications for booking confirmations and review replies

---

## Contributors

| Name | Role | GitHub |
|------|------|--------|
| Ujjwal Pratap Singh | Full Stack Developer | [@ujjwal9034](https://github.com/ujjwal9034) |

---

## License

This project was built as part of the **TBI GEU Summer Internship** capstone program.

---

> Built with ❤️ using React, Node.js, MongoDB, and Google Gemini AI