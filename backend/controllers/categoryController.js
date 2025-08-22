import Category from "../models/Category.js";

// ➕ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📖 Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
