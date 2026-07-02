# 🏠 StayWise — AI-Powered Homestay Management Assistant

An AI-powered platform that helps homestay owners manage guest reviews, customer queries, and tourist assistance.

## Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend  | Node.js + Express.js           |
| Database | MongoDB Atlas + Mongoose       |
| AI       | OpenAI API *(planned)*         |

## Features

- ⭐ Review Management (CRUD via REST API)
- 🤖 AI Response Suggestions
- 🗺️ Tourist Assistance
- 💬 Query Management
- 📊 Dashboard Analytics
- 🗄️ MongoDB Atlas Database Integration

---

## Database Used

**MongoDB Atlas** — A cloud-hosted NoSQL database service by MongoDB.

All review data is stored in a MongoDB Atlas cluster and accessed via the **Mongoose** ODM (Object Data Modeling) library.

## Why MongoDB

| Reason                    | Explanation                                                                         |
|---------------------------|-------------------------------------------------------------------------------------|
| **JSON-native**           | MongoDB stores data as BSON (Binary JSON), which maps naturally to JavaScript objects |
| **Flexible Schema**       | Reviews can evolve over time without rigid table migrations                          |
| **MERN Stack Standard**   | MongoDB is the "M" in MERN — ideal pairing with Express, React, and Node.js         |
| **Cloud-hosted (Atlas)**  | No local database setup needed; accessible from anywhere                            |
| **Mongoose ODM**          | Provides schema validation, middleware, and query building out of the box            |
| **Beginner-friendly**     | Widely taught, excellent documentation, and large community support                  |

## Schema

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

---

## Project Structure

```
AI-Powered-Homestay-Management-Assistant/
├── backend/
│   ├── config/             # Database configuration
│   │   └── db.js           # MongoDB connection logic
│   ├── controllers/        # Route handler logic
│   │   ├── healthController.js
│   │   └── reviewController.js
│   ├── data/               # Static seed data (JSON)
│   │   └── reviews.json
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── models/             # Mongoose schemas/models
│   │   └── Review.js
│   ├── routes/             # API route definitions
│   │   ├── healthRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   ├── seed.js             # Database seeder script
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── services/       # API service layer (Axios)
│   ├── package.json
│   └── vite.config.js
└── README.md
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

🏠 StayWise API server running on http://localhost:5001
📋 Health check:  http://localhost:5001/api/health
⭐ Reviews API:   http://localhost:5001/api/reviews
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

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-Powered-Homestay-Management-Assistant.git
cd AI-Powered-Homestay-Management-Assistant
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env        # Create environment file
# Edit .env and add your MONGO_URI
npm install                 # Install dependencies
node seed.js                # Seed database with sample reviews
npm run dev                 # Start with auto-reload (nodemon)
```

The API server will start at **http://localhost:5001**.

#### Available API Endpoints

| Method   | Endpoint            | Description             |
|----------|---------------------|-------------------------|
| `GET`    | `/api/health`       | Server health check     |
| `GET`    | `/api/reviews`      | Get all reviews         |
| `GET`    | `/api/reviews/:id`  | Get review by ID        |
| `POST`   | `/api/reviews`      | Create a new review     |
| `PUT`    | `/api/reviews/:id`  | Full update a review    |
| `PATCH`  | `/api/reviews/:id`  | Partial update a review |
| `DELETE` | `/api/reviews/:id`  | Delete a review         |

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

| Variable    | Default | Description                          |
|-------------|---------|--------------------------------------|
| `PORT`      | `5001`  | API server port                      |
| `MONGO_URI` | —       | MongoDB Atlas connection string      |

### `backend/.env.example`

```env
# Server Configuration
PORT=5001

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/staywise?retryWrites=true&w=majority
```

---

## Weekly Progress

- **Week 2:** Frontend skeleton completed (React + Vite + Tailwind)
- **Week 4:** Backend & API development (Express.js REST API with mock data, frontend integration via Axios)
- **Week 5:** Database integration (MongoDB Atlas + Mongoose, schema validation, all CRUD endpoints connected to real database)