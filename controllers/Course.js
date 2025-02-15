const User = require("../models/User");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { uploadToCloudinary } = require("../utils/ImageUploader");

exports.createCourse = async (req, res) => {
  try {
    // fetching data from req
    const { courseName, courseDescription, whatYouWillLearn, price, category, instructions, tags, status } = req.body
    const thumbnailImage = req.files.thumbnail

    // input validation
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnailImage || !instructions || !tags) {
      res.status(401).json({
        success: false,
        message: "Please fill all the required fileds!"
      })
    }

    // fetching instructor details
    const instructorDetails = await User.findById(req.user.id)
    if (!instructorDetails) {
      res.status(401).json({
        success: false,
        message: "Cannot Fetch Instructor Details!"
      })
    }

    // fetching category details
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      res.status(401).json({
        success: false,
        message: "Cannot Fetch category Details!"
      })
    }

    // uploading image to cludinary
    const thumbNail = await uploadToCloudinary(thumbnailImage, process.env.FOLDER_NAME)

    // setting status to draft if not provided
    if (!status || status === undefined) {
      status = "Draft";
    }

    // creating course entry in db
    const newCourse = await Course.create({
      courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price,
      thumbNail: thumbNail.secure_url, category: categoryDetails._id, instructions, tags, status
    })

    // updating instructor by adding course id in courses array of the instructor
    await User.findByIdAndUpdate(instructorDetails._id, { $push: { courses: newCourse._id } }, { new: true })

    // updating instructor by adding course id in courses array of the instructor
    await Category.findByIdAndUpdate(categoryDetails._id, { $push: { courses: newCourse._id } }, { new: true })

    // success response
    res.status(200).json({
      success: true,
      message: "Course Created Successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};

// fetching all courses
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({},
      { courseName: true, price: true, thumbNail: true, instructor: true, ratingAndReview: true, studentsEnrolled: true }
    ).populate("instructor").exec()

    res.status(200).json({
      success: false,
      message: "All courses fetched successfully!",
      allCourses
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// getting particular course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findById(courseId)
      .populate({path: "instructor", populate: {path: "additionalDetails"}})
      .populate({path: "courseContent", populate: {path: "subSection"}})
      .populate("category")
      .populate("ratingAndReview")
      .exec()

    // checking if course is present
    if (!courseDetails) {
      return res.status(401).json({
        success: false,
        message: "Course not found!"
      })
    }

    // success response 
    res.status(200).json({
      success: true,
      message: "Course details fetched successfully!",
      courseDetails
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong while fetching course details: ${error.message}`
    })
  }
}
