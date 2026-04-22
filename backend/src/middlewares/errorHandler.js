/**
 * Error Handler Middleware
 * Catches all errors thrown in route handlers and returns a uniform JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
