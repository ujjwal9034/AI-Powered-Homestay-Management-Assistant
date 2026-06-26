/**
 * Request Logger Middleware
 * Logs each incoming request with method, path, and timestamp.
 */

const requestLogger = (req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = requestLogger;
