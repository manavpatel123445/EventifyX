import User from "./user.model.js";

export class UserRepository {
  async findById(id, selectFields = "") {
    return User.findById(id).select(selectFields);
  }

  async findByEmail(email, selectFields = "") {
    return User.findOne({ email: email.toLowerCase() }).select(selectFields);
  }

  async findByResetToken(hashedToken) {
    return User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async list(filters = {}, pagination = { skip: 0, limit: 10 }, sort = { createdAt: -1 }) {
    return User.find(filters)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(sort);
  }

  async count(filters = {}) {
    return User.countDocuments(filters);
  }
}

export const userRepository = new UserRepository();
export default userRepository;
