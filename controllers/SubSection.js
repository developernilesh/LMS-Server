const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const { uploadToCloudinary } = require("../utils/ImageUploader")

// creating new SubSection
exports.createSubSection = async (req, res) => {
  try {
    // fetching data from req
    const { title, timeDuration, description, sectionId } = req.body
    const videoToUpload = req.files.videoFile

    // input validations
    if (!title || !timeDuration || !description || !videoToUpload) {
      return res.status(401).json({
        success: false,
        message: "Please fill all the required fields",
      })
    }
    if (!sectionId) {
      return res.status(401).json({
        success: false,
        message: "Cannot create sub-section at moment. Please try again!",
      })
    }

    // uploading video to cloudinary
    const uploadedVideo = await uploadToCloudinary(videoToUpload, process.env.FOLDER_NAME)
    if (!uploadedVideo) {
      return res.status(401).json({
        success: false,
        message: "Failed to upload the video. Please try again!",
      })
    }

    // creating entry in db for the new subsection
    const newSubSection = await SubSection.create({ title, description, timeDuration, videoUrl: uploadedVideo.secure_url })

    // updating the corrrespponding section by adding the new sub-section
    await Section.findByIdAndUpdate(sectionId, { $push: { subSection: newSubSection._id } }, { new: true })

    // success reponse
    res.status(200).json({
      success: true,
      message: "Sub Section created successfully!",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// updating an existing sub-section
exports.updateSubSection = async (req, res) => {
  try {
    // fetching data from req
    const { title, timeDuration, description, subSectionId } = req.body
    const videoToUpload = req.files?.videoFile

    // input validations
    if (!title || !timeDuration || !description || !subSectionId) {
      return res.status(401).json({
        success: false,
        message: "Please fill all the required fields",
      })
    }
    if (!subSectionId) {
      return res.status(401).json({
        success: false,
        message: "Cannot create sub-section at moment. Please try again!",
      })
    }

    // Check if a new video file is uploaded
    let updatedFields = { title, timeDuration, description }
    if (videoToUpload) {
      // Upload new video to Cloudinary
      const uploadedVideo = await uploadToCloudinary(videoToUpload, process.env.FOLDER_NAME)
      if (!uploadedVideo) {
        return res.status(401).json({
          success: false,
          message: "Failed to upload the video. Please try again!",
        })
      }
      // Update videoUrl in SubSection model
      updatedFields.videoUrl = uploadedVideo.secure_url
    }

    // Update the sub-section in db
    const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId, updatedFields, { new: true })

    // Success response
    res.status(200).json({
      success: true,
      message: "Sub Section updated successfully!",
      updatedSubSection,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// deletion of a sub-section
exports.deleteSubSection = async (res,res) => {
  try {
    // fetching the sub-section id
    const { subSectionId } = req.body

    // input validation
    if (!subSectionId) {
      return res.status(401).json({
        success: false,
        message: "Cannot delete sub-section at moment. Please try again!",
      })
    }

    // deleteion of the sub-section from db
    await SubSection.findByIdAndDelete(subSectionId)

    // Success response
    res.status(200).json({
      success: true,
      message: "Sub Section deleted successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}