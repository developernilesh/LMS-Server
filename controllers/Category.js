const Category = require("../models/Category");

// creating new category
exports.createCategory = async (req, res) => {
  try {
    // fetching data from req body
    const { name, description } = req.body;

    // validation for the inputs
    if (!name || !description) {
      res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }

    // creating entry in db
    await Category.create({ name, description })

    // success response
    res.status(200).json({
      success: true,
      message: "Category created successfully!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// fetching all categories
exports.showAllCategorys = async (req, res) => {
  try {
    const allCategories = await Category.find({}, { name: true, description: true })
    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      allCategories
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}