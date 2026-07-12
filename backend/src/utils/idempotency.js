import crypto from "crypto";
import { redisService } from "../services/redis.js";
import ApiError from "./ApiError.js";
import STATUS_CODES from "../constants/statusCodes.js";

/**
 * Checks if a request has been made with a specific Idempotency-Key.
 * If yes, it throws or returns cached response.
 * If no, it reserves the key in Redis for a temporary time.
 */
export const checkIdempotency = async (key, reqBody) => {
  if (!key) return null;

  // Hash the body to ensure same key is not used with different inputs
  const bodyHash = crypto.createHash("sha256").update(JSON.stringify(reqBody || {})).digest("hex");
  const redisKey = `idempotency:${key}`;

  try {
    const existing = await redisService.get(redisKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.bodyHash !== bodyHash) {
        throw new ApiError(STATUS_CODES.CONFLICT, "Idempotency key mismatch with request payload");
      }
      return parsed.response;
    }

    // Reserve for 10 minutes
    await redisService.set(redisKey, JSON.stringify({ bodyHash, status: "pending" }), 600);
    return null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Log Redis error and proceed as fallback (fail-open)
    console.error("Idempotency Redis error:", error);
    return null;
  }
};

export const saveIdempotencyResponse = async (key, response) => {
  if (!key) return;
  const redisKey = `idempotency:${key}`;
  try {
    const existing = await redisService.get(redisKey);
    if (existing) {
      const parsed = JSON.parse(existing);
      parsed.status = "completed";
      parsed.response = response;
      await redisService.set(redisKey, JSON.stringify(parsed), 600);
    }
  } catch (error) {
    console.error("Failed to save idempotency response to Redis:", error);
  }
};
