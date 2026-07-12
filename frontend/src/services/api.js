/**
 * API Service — Axios instance & API helpers for StayWise frontend.
 * Includes review CRUD, homestay CRUD, admin APIs, and authentication.
 *
 * Multi-Role System: Customer, Owner, Admin
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

export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch {
    return { success: true, message: 'Logged out locally' };
  }
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const getGoogleAuthUrl = () => {
  const baseUrl = API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin);
  return `${baseUrl}/api/auth/google`;
};

// ─── Homestay API ───────────────────────────────────────────────────────────────

export const fetchHomestays = async () => {
  const response = await api.get('/api/homestays');
  return response.data;
};

export const fetchHomestayById = async (id) => {
  const response = await api.get(`/api/homestays/${id}`);
  return response.data;
};

export const fetchMyHomestays = async () => {
  const response = await api.get('/api/homestays/mine');
  return response.data;
};

export const createHomestay = async (data) => {
  const response = await api.post('/api/homestays', data);
  return response.data;
};

export const updateHomestay = async (id, data) => {
  const response = await api.put(`/api/homestays/${id}`, data);
  return response.data;
};

export const deleteHomestay = async (id) => {
  const response = await api.delete(`/api/homestays/${id}`);
  return response.data;
};

// ─── Review API ─────────────────────────────────────────────────────────────────

export const fetchMyReviews = async () => {
  const response = await api.get('/api/reviews/mine');
  return response.data;
};

export const fetchHomestayReviews = async (homestayId) => {
  const response = await api.get(`/api/reviews/homestay/${homestayId}`);
  return response.data;
};

export const fetchAllReviews = async () => {
  const response = await api.get('/api/reviews');
  return response.data;
};

export const createReview = async (data) => {
  const response = await api.post('/api/reviews', data);
  return response.data;
};

export const updateReview = async (id, data) => {
  const response = await api.put(`/api/reviews/${id}`, data);
  return response.data;
};

export const replyToReview = async (id, text) => {
  const response = await api.patch(`/api/reviews/${id}/reply`, { text });
  return response.data;
};

export const requestReviewSuggestion = async (id) => {
  const response = await api.post(`/api/reviews/${id}/suggest`);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/api/reviews/${id}`);
  return response.data;
};

// ─── Admin API ──────────────────────────────────────────────────────────────────

export const fetchAdminStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/api/admin/users/${id}`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
};

export const chatWithLocalGuide = async (id, message, history) => {
  const response = await api.post(`/api/homestays/${id}/chat`, { message, history });
  return response.data;
};

export const enhanceHomestayDescription = async (data) => {
  const response = await api.post('/api/homestays/enhance', data);
  return response.data;
};

// Booking APIs
export const createBooking = async (data) => {
  const response = await api.post('/api/bookings', data);
  return response.data;
};

export const fetchMyBookings = async () => {
  const response = await api.get('/api/bookings/mine');
  return response.data;
};

export const fetchOwnerBookings = async () => {
  const response = await api.get('/api/bookings/owner');
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(`/api/bookings/${id}/status`, { status });
  return response.data;
};

export default api;
