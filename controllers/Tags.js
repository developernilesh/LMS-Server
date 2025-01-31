const Tag = require("../models/Tags");

// creating new tag
exports.createTag = async (req, res) => {
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
    const tagDetails = await Tag.create({ name, description })

    // success response
    res.status(200).json({
      success: true,
      message: "Tag created successfully!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// fetching all tags
exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true })
    res.status(200).json({
      success: true,
      message: "All tags fetched successfully",
      allTags
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}