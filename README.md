# 🏠 StayWise — AI-Powered Homestay Management Assistant

An AI-powered platform that helps homestay owners manage guest reviews, customer queries, and tourist assistance.

## Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend  | Node.js + Express.js           |
| Database | MongoDB Atlas *(planned)*      |
| AI       | OpenAI API *(planned)*         |

## Features

- ⭐ Review Management (CRUD via REST API)
- 🤖 AI Response Suggestions
- 🗺️ Tourist Assistance
- 💬 Query Management
- 📊 Dashboard Analytics

---

## Project Structure

```
AI-Powered-Homestay-Management-Assistant/
├── backend/
│   ├── controllers/        # Route handler logic
│   │   ├── healthController.js
│   │   └── reviewController.js
│   ├── data/               # Mock JSON data
│   │   └── reviews.json
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/             # API route definitions
│   │   ├── healthRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env.example
│   ├── package.json
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

## How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AI-Powered-Homestay-Management-Assistant.git
cd AI-Powered-Homestay-Management-Assistant
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env        # Create environment file
npm install                 # Install dependencies
npm run dev                 # Start with auto-reload (nodemon)
# or
npm start                   # Start without auto-reload
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

| Variable | Default | Description       |
|----------|---------|-------------------|
| `PORT`   | `5001`  | API server port   |

---

## Weekly Progress

- **Week 2:** Frontend skeleton completed (React + Vite + Tailwind)
- **Week 4:** Backend & API development (Express.js REST API with mock data, frontend integration via Axios)