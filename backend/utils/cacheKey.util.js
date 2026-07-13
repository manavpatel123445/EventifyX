import crypto from 'crypto';

/**
 * Generate a deterministic cache key.
 * Format: app:{env}:v1:{module}:{resource}:{identifier}:{queryHash}
 */
export const generateCacheKey = (module, resource, identifier = 'all', query = {}) => {
  const env = process.env.NODE_ENV || 'development';
  
  // Sort query keys to ensure same queries always generate the same hash
  let queryHash = '';
  if (Object.keys(query).length > 0) {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});
      
    // Create a short MD5 hash of the query object
    queryHash = crypto.createHash('md5').update(JSON.stringify(sortedQuery)).digest('hex').substring(0, 8);
  }

  const parts = [
    'app',
    env,
    'v1',
    module,
    resource,
    identifier
  ];

  if (queryHash) {
    parts.push(`q_${queryHash}`);
  }

  return parts.join(':');
};
