import userRepository from "./user.repository.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
    }
    return user;
  }

  async updateUserProfile(userId, updateData) {
    const safeData = { ...updateData };
    delete safeData.email;
    delete safeData.password;
    delete safeData.role;
    delete safeData.status;

    const user = await userRepository.update(userId, safeData);
    if (!user) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
    }
    return user;
  }

  async listUsers(filters, pagination) {
    const users = await userRepository.list(filters, pagination);
    const total = await userRepository.count(filters);
    return { users, total };
  }

  async updateUserStatus(userId, status) {
    if (!["active", "blocked"].includes(status)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid status");
    }
    const user = await userRepository.update(userId, { status });
    if (!user) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
    }
    return user;
  }
}

export const userService = new UserService();
export default userService;
