import { requestStore } from "../utils/logger.js";

export const requestIdMiddleware = (req, res, next) => {
  // Use existing header or generate a new random UUID (natively supported in Node.js 18+)
  const requestId = req.header("X-Request-ID") || crypto.randomUUID();
  
  // Set in response header so clients can trace it
  res.setHeader("X-Request-ID", requestId);

  // Set Request Context inside AsyncLocalStorage
  requestStore.run({ requestId }, () => {
    next();
  });
};

export default requestIdMiddleware;
