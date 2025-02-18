const Course = require("../models/Course");
const Section = require("../models/Section");

// creating a new section
exports.createSection = async (req, res) => {
  try {
    // fetching data from req body
    const { sectionName, courseId } = req.body

    // validations
    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: "Please put the section name!"
      })
    }
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Unable to update section. Please try again!"
      })
    }

    // creating entry in db for the new section
    const newSection = await Section.create({ sectionName })

    // adding the new section to the corresponding course
    await Course.findByIdAndUpdate(courseId, { $push: { courseContent: newSection._id } }, { new: true })

    // success response
    res.status(200).json({
      success: true,
      message: "Section Created Successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong!"
    })
  }
};

// updating a section
exports.updateSection = async (req, res) => {
  try {
    // fetching data from req body
    const { sectionName, sectionId } = req.body

    // validations
    if (!sectionName) {
      return res.status(400).json({
        success: false,
        message: "Please put the section name!"
      })
    }
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Unable to update the Section. Please try again!"
      })
    }

    // adding the new section to the corresponding course
    await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true })

    // success response
    res.status(200).json({
      success: true,
      message: "Section Updated Successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong!"
    })
  }
};

// deleting a section
exports.deleteSection = async (req, res) => {
  try {
    // fetching data from req body
    const {sectionId} = req.body

    // validations
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "Unable to delete the section. Please try again!"
      })
    }
    console.log("1", sectionId)
    // deletion of the section
    const section = await Section.findByIdAndDelete(sectionId);
    console.log("2", section)
    // success response
    res.status(200).json({
      success: true,
      message: "Section deleted successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong!"
    })
  }
}