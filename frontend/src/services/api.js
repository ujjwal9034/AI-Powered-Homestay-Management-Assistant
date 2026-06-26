/**
 * API Service — Axios instance & review API helpers for StayWise frontend.
 * Connects to the Express backend at the configured base URL.
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


/**
 * Fetch all reviews.
 * @returns {Promise<Array>} Array of review objects
 */
export const fetchReviews = async () => {
  const response = await api.get('/api/reviews');
  return response.data;
};

/**
 * Fetch a single review by ID.
 * @param {number} id
 * @returns {Promise<Object>} Review object
 */
export const fetchReviewById = async (id) => {
  const response = await api.get(`/api/reviews/${id}`);
  return response.data;
};

/**
 * Create a new review.
 * @param {Object} reviewData
 * @returns {Promise<Object>} Created review
 */
export const createReview = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response.data;
};

/**
 * Full-update a review (PUT).
 * @param {number} id
 * @param {Object} reviewData
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/api/reviews/${id}`, reviewData);
  return response.data;
};

/**
 * Partially update a review (PATCH).
 * @param {number} id
 * @param {Object} fields
 * @returns {Promise<Object>} Updated review
 */
export const patchReview = async (id, fields) => {
  const response = await api.patch(`/api/reviews/${id}`, fields);
  return response.data;
};

/**
 * Delete a review.
 * @param {number} id
 * @returns {Promise<Object>} Deleted review
 */
export const deleteReview = async (id) => {
  const response = await api.delete(`/api/reviews/${id}`);
  return response.data;
};

export default api;
