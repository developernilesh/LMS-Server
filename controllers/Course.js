const User = require("../models/User");
const Tags = require("../models/Tags");
const Course = require("../models/Course");
const { uploadToCloudinary } = require("../utils/ImageUploader");

exports.createCourse = async (req, res) => {
  try {
    // fetching data from req
    const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body
    const thumbnailImage = req.files.thumbnail

    // input validation
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnailImage) {
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

    // fetching tag details
    const tagDetails = await Tags.findById(tag)
    if (!tagDetails) {
      res.status(401).json({
        success: false,
        message: "Cannot Fetch Tag Details!"
      })
    }

    // uploading image to cludinary
    const thumbNail = await uploadToCloudinary(thumbnailImage, process.env.FOLDER_NAME)

    // creating course entry in db
    const newCourse = await Course.create({
      courseName, courseDescription, instructor: instructorDetails._id, whatYouWillLearn, price,
      thumbNail: thumbNail.secure_url, tag: tagDetails._id
    })

    // updating instructor by adding course id in courses array of the instructor
    await User.findByIdAndUpdate(instructorDetails._id, { $push: { courses: newCourse._id } }, { new: true })

    // updating instructor by adding course id in courses array of the instructor
    await Tags.findByIdAndUpdate(tagDetails._id, { $push: { courses: newCourse._id } }, { new: true })

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
      {courseName:true,price:true,thumbNail:true,instructor:true,ratingAndReview:true,studentsEnrolled:true}
    ).populate("instructor").exec()

    res.status(200).json({
      success: false,
      message: "All courses fetched successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}