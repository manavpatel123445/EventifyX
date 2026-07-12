import APP_CONSTANTS from "../constants/appConstants.js";

/**
 * Normalizes page and limit and returns mongoose offset/limit parameters
 * @param {Object} query - The Express request query object
 * @returns {Object} { page, limit, skip }
 */
export const getPagination = (query) => {
  let page = parseInt(query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

  if (page <= 0) page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
  if (limit <= 0) limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
  if (limit > APP_CONSTANTS.PAGINATION.MAX_LIMIT) limit = APP_CONSTANTS.PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Formats a paginated response wrapper
 * @param {Array} data - Paginated data array
 * @param {number} totalItems - Total records matching query
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response payload
 */
export const formatPaginatedResponse = (data, totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    items: data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
