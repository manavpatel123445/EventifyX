import categoryService from "./category.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import STATUS_CODES from "../../constants/statusCodes.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(STATUS_CODES.CREATED || 201).json(
    new ApiResponse(STATUS_CODES.CREATED || 201, category, "Category created successfully")
  );
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.user?.role, req.query.status);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, categories, "Categories fetched successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, null, "Category deleted successfully"));
});

export default {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
