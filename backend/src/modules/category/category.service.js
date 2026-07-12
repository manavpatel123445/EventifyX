import mongoose from "mongoose";
import categoryRepository from "./category.repository.js";
import ApiError from "../../utils/ApiError.js";
import STATUS_CODES from "../../constants/statusCodes.js";

export class CategoryService {
  async createCategory({ name, description, icon, color }) {
    const existing = await categoryRepository.findByName(name);
    if (existing) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Category with this name already exists");
    }
    return categoryRepository.create({ name, description, icon, color });
  }

  async getCategories(role, statusQuery) {
    const filter = {};
    if (statusQuery) {
      filter.status = statusQuery;
    } else if (role !== "admin") {
      filter.status = "active";
    }
    return categoryRepository.list(filter);
  }

  async updateCategory(id, { name, description, status, icon, color }) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Category not found");
    }

    if (name && name !== category.name) {
      const existing = await categoryRepository.findByNameExcludingId(name, id);
      if (existing) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, "Category with this name already exists");
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;

    return category.save();
  }

  async deleteCategory(id) {
    const Event = mongoose.model("Event");
    const EventRequest = mongoose.model("EventRequest");

    const eventCount = await Event.countDocuments({ category: id });
    const requestCount = await EventRequest.countDocuments({ category: id });

    if (eventCount > 0 || requestCount > 0) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        `Cannot delete category. It has ${eventCount} events and ${requestCount} event requests.`
      );
    }

    const category = await categoryRepository.delete(id);
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Category not found");
    }

    return category;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
