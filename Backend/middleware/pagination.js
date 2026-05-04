/**
 * Pagination Middleware
 * Validates and extracts pagination parameters from request query
 * Adds safe pagination values to req.pagination
 */

const paginationMiddleware = (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 20;

  // Validation: Ensure page is at least 1
  page = Math.max(1, page);

  // Safety: Cap limit to prevent resource exhaustion
  // Prevents requesting 100000 records at once
  limit = Math.min(100, Math.max(1, limit));

  // Add safe pagination values to request
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };

  next();
};

/**
 * Express response helper for paginated responses
 * Usage: res.sendPaginated(data, total, req)
 */
const paginatedResponse = (data, total, req) => {
  const { page, limit } = req.pagination;
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  paginationMiddleware,
  paginatedResponse
};
