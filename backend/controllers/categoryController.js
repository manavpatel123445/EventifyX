import Category from "../models/Category.js";
import Event from "../models/Event.js";
import EventRequest from "../models/EventRequest.js";
import { cacheService } from "../services/cache.service.js";
import { CACHE_PREFIX } from "../constants/cache.constants.js";

// ➕ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const existingCategory = await Category.findOne({ 
      name: new RegExp(name, 'i') 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({ name, description });
    await category.save();
    
    // Invalidate categories cache
    await cacheService.delByPattern(`app:*:v1:${CACHE_PREFIX.CATEGORIES}:*`);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📖 Get All Categories
export const getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else if (req.user?.role !== 'admin') filter.status = "active";

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: new RegExp(name, 'i'),
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      category.name = name;
    }
    
    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    await category.save();
    
    // Invalidate categories cache
    await cacheService.delByPattern(`app:*:v1:${CACHE_PREFIX.CATEGORIES}:*`);
    
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ Delete Category (Checks for dependencies)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has events or requests
    const eventCount = await Event.countDocuments({ category: id });
    const requestCount = await EventRequest.countDocuments({ category: id });
    
    if (eventCount > 0 || requestCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${eventCount} events and ${requestCount} event requests.`
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    // Invalidate categories cache
    await cacheService.delByPattern(`app:*:v1:${CACHE_PREFIX.CATEGORIES}:*`);

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
