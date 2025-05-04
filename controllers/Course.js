const User = require("../models/User");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { uploadToCloudinary } = require("../utils/ImageUploader");
require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    // fetching data from req
    const { courseName, courseDescription, whatYouWillLearn, price, category, instructions, tags, status = "Draft" } = req.body
    const thumbnailImage = req.files.thumbnail
    const instructorId = req.user.id

    // input validation
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnailImage || !instructions || !tags) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fileds!"
      })
    }

    // fetching instructor details
    const instructorDetails = await User.findById(instructorId)
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot Fetch Instructor Details!"
      })
    }

    // fetching category details
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot Fetch category Details!"
      })
    }
    // uploading image to cludinary
    const thumbNail = await uploadToCloudinary(thumbnailImage, process.env.FOLDER_NAME)

    // creating course entry in db
    const newCourse = await Course.create({
      courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price, thumbNail: thumbNail, 
      category: categoryDetails._id, instructions: JSON.parse(instructions), tags: JSON.parse(tags), status
    })

    // updating instructor by adding course id in courses array of the instructor
    await User.findByIdAndUpdate(instructorDetails._id, { $push: { courses: newCourse._id } }, { new: true })

    // updating instructor by adding course id in courses array of the category
    await Category.findByIdAndUpdate(categoryDetails._id, { $push: { courses: newCourse._id } }, { new: true })
    
    // success response
    res.status(200).json({
      success: true,
      message: "Course Initiated Successfully!",
      courseInfo: newCourse
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};

// Editing a course
exports.editCourse = async (req, res) => {
  try {
    // fetching data from req
    const { courseName, courseDescription, whatYouWillLearn, price, category, instructions, tags, courseId } = req.body
    const thumbnailImage = req.files?.thumbnail

    // input validation
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !instructions || !tags) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fileds!"
      })
    }
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit course at moment. Please try again!",
      })
    }
    // fetching instructor details
    const courseDetails = await Course.findById(courseId)
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot Fetch Instructor Details!"
      })
    }
    
    // updating the fields
    let updatedFields = { courseName, courseDescription, whatYouWillLearn, price, category, 
      instructions: JSON.parse(instructions), tags: JSON.parse(tags) }
    
    // uploading image to cloudinary
    if(thumbnailImage){
      const thumbNailImg = await uploadToCloudinary(thumbnailImage, process.env.FOLDER_NAME)
      updatedFields.thumbNail = thumbNailImg
    }

    // Update the sub-section in db
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedFields, { new: true })
    if (!updatedCourse) {
      return res.status(400).json({
        success: false,
        message: "Cannot update the sub-section at moment. Please try again!",
      })
    }

    // success response
    res.status(200).json({
      success: true,
      message: "Course Informations Updated Successfully!",
      courseInfo: updatedCourse
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};

// Publishing Course
exports.publishCourse = async (req,res) => {
  try {
    const {courseId,status} = req.body

    if(!courseId || !status || status !== 'Published'){
      return res.status(400).json({
        success: false,
        message: "Cannot Publish Course At Moment!"
      })
    }

    const courseDetails = await Course.findById(courseId)
    courseDetails.status = status
    await courseDetails.save()

    res.status(200).json({
      success: true,
      message: "Course Published Successfully!",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// fetching all courses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({},
      { courseName: true, courseDescription: true, price: true, thumbNail: true, instructor: true, ratingAndReview: true, studentsEnrolled: true }
    ).populate({ path: "instructor", select: "firstName lastName email image", populate: { path: "additionalDetails" } })
      .exec()

    res.status(200).json({
      success: true,
      message: "All courses fetched successfully!",
      data: allCourses
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
}

// getting particular course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params
    const courseDetails = await Course.findById(courseId)
      .populate({ path: "instructor", select: "firstName lastName email image", populate: { path: "additionalDetails" } })
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .populate("ratingAndReview")
      .exec()

    // checking if course is present
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Course not found!"
      })
    }

    // success response 
    res.status(200).json({
      success: true,
      message: "Course details fetched successfully!",
      data: courseDetails
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
}
