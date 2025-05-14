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
      message: `Something went wrong: ${error.message}`,
    });
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
      message: `Something went wrong: ${error.message}`,
    });
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // getting details of category
    const categoryDetails = await Category.findById(categoryId)
      .populate({ path: "courses", populate: { path: "ratingAndReview" } })
      .exec();

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Courses not found",
      });
    }

    // getting most popular courses in the paricular category
    const mostPopular = await Category.findById(categoryId)
      .populate({ path: "courses", populate: { path: "ratingAndReview" } })
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .exec();

    // getting top selling courses for different categories
    const differentCategories = await Course.find({
      category: { $ne: categoryId },
    })
      .sort({ studentsEnrolled: -1 })
      .populate("ratingAndReview")
      .exec();

    // top selling courses (of all categories)
    const topSellingCourses = await Course.find({})
      .sort({ studentsEnrolled: -1 })
      .populate("ratingAndReview")
      .exec();

    // returning response
    return res.status(200).json({
      success: true,
      message: "Category details fetched successfully",
      data: {
        categoryDetails,
        mostPopular,
        differentCategories,
        topSellingCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};
