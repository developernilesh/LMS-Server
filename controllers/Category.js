const Category = require("../models/Category");
const Course = require("../models/Course");

// creating new category
exports.createCategory = async (req, res) => {
  try {
    // fetching data from req body
    const { name, description } = req.body;

    // validation for the inputs
    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // creating entry in db
    const category = await Category.create({ name, description });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not created",
      });
    }

    // success response
    res.status(200).json({
      success: true,
      message: "Category created successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// fetching all categories
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      data: allCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // getting details of category
    const categoryDetails = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Courses not found",
      });
    }

    // getting courses for different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    // getting top selling courses
    const topSellingCourses = await Course.find({})
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .populate("ratingAndReview")
      .exec();

    // returning response
    return res.status(200).json({
      success: true,
      message: "Category details fetched successfully",
      data: {
        categoryDetails,
        differentCategories,
        topSellingCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};
