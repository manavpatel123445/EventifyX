import ApiError from "../utils/ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

/**
 * Higher-order middleware to validate request payload
 * @param {Function|Object} schema - Validation function or schema validator
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    // If schema is a function, call it with (req.body, req.query, req.params)
    if (typeof schema === "function") {
      try {
        const error = schema(req.body, req.query, req.params);
        if (error) {
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, error));
        }
        return next();
      } catch (err) {
        return next(new ApiError(STATUS_CODES.BAD_REQUEST, err.message));
      }
    }

    // If Joi schema
    if (schema && typeof schema.validate === "function") {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(", ");
        return next(new ApiError(STATUS_CODES.BAD_REQUEST, errorMessage));
      }

      req.body = value;
      return next();
    }

    next();
  };
};

export default validate;
