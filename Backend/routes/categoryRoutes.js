const express = require("express");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all categories with course counts (admin only)
router.get("/admin", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Get course counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const courseCount = await Course.countDocuments({ category: category.name });
        return {
          ...category.toObject(),
          courseCount
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new category (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      icon: icon?.trim(),
      color: color || "#6366f1"
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update category (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Check if another category with same name exists
    const existingCategory = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description?.trim(),
        icon: icon?.trim(),
        color: color || "#6366f1",
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete category (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category has courses
    const courseCount = await Course.countDocuments({ category: category.name });
    if (courseCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. ${courseCount} course(s) are using this category.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;