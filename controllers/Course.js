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
    const constructorDetails = await User.findById(req.user.id)
    if(!constructorDetails){
      res.status(401).json({
        success: false,
        message: "Cannot Fetch Instructor Details!"
      })
    }

    // fetching tag details
    const tagDetails = await Tags.findById(tag)
    if(!tagDetails){
      res.status(401).json({
        success: false,
        message: "Cannot Fetch Tag Details!"
      })
    }

    // uploading image to cludinary
    const thumbNail = await uploadToCloudinary(thumbnailImage, process.env.FOLDER_NAME)

    // creating course entry in db
    const newCourse = await Course.create({})
  } catch (error) { }
};
