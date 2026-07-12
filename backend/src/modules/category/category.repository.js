import Category from "./category.model.js";

export class CategoryRepository {
  async findById(id) {
    return Category.findById(id);
  }

  async findByName(name) {
    return Category.findOne({ name: new RegExp(`^${name}$`, "i") });
  }

  async findByNameExcludingId(name, id) {
    return Category.findOne({
      name: new RegExp(`^${name}$`, "i"),
      _id: { $ne: id },
    });
  }

  async create(data) {
    return Category.create(data);
  }

  async update(id, updateData) {
    return Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return Category.findByIdAndDelete(id);
  }

  async list(filters = {}) {
    return Category.find(filters).sort({ name: 1 });
  }
}

export const categoryRepository = new CategoryRepository();
export default categoryRepository;
