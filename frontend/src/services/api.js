/**
 * API Service — Axios instance & API helpers for StayWise frontend.
 * Includes review CRUD + authentication endpoints.
 *
 * Week 6 — Added logout, Google OAuth URL helper.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Auth interceptor: attach JWT token to every request ────────────────────────
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('staywise-user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ─── Auth API ───────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 */
export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

/**
 * Login with email and password.
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

/**
 * Logout the current user.
 */
export const logoutUser = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch {
    // If logout fails (e.g., token already expired), still return success
    return { success: true, message: 'Logged out locally' };
  }
};

/**
 * Get current user profile.
 */
export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

/**
 * Get the Google OAuth initiation URL.
 */
export const getGoogleAuthUrl = () => {
  const baseUrl = API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin);
  return `${baseUrl}/api/auth/google`;
};

// ─── Review API ─────────────────────────────────────────────────────────────────

/**
 * Fetch all reviews.
 */
export const fetchReviews = async () => {
  const response = await api.get('/api/reviews');
  return response.data;
};

/**
 * Fetch a single review by ID.
 */
export const fetchReviewById = async (id) => {
  const response = await api.get(`/api/reviews/${id}`);
  return response.data;
};

/**
 * Create a new review.
 */
export const createReview = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response.data;
};

/**
 * Full-update a review (PUT).
 */
export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/api/reviews/${id}`, reviewData);
  return response.data;
};

/**
 * Partially update a review (PATCH).
 */
export const patchReview = async (id, fields) => {
  const response = await api.patch(`/api/reviews/${id}`, fields);
  return response.data;
};

/**
 * Delete a review.
 */
export const deleteReview = async (id) => {
  const response = await api.delete(`/api/reviews/${id}`);
  return response.data;
};

export default api;
