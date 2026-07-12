/**
 * Safely builds search queries with escape patterns
 * @param {string} searchField - The field to search in
 * @param {string} searchTerm - The string query input
 * @returns {Object} Search query clause
 */
export const buildRegexSearch = (searchField, searchTerm) => {
  if (!searchTerm) return {};
  // Escape regex special characters
  const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  return { [searchField]: { $regex: escaped, $options: "i" } };
};

/**
 * Filter out keys with undefined/null values to build clean query objects
 * @param {Object} filters - Input filters object
 * @returns {Object} Sanitized filters
 */
export const sanitizeFilters = (filters) => {
  const sanitized = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
      sanitized[key] = filters[key];
    }
  });
  return sanitized;
};
