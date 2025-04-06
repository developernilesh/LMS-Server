const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/ImageUploader");
require("dotenv").config();
// update profile
exports.updateProfile = async (req, res) => {
  try {
    // fetching data from req body
    const { firstName, lastName, contact, gender, dateOfBirth = "", about = "" } = req.body;
    const userId = req.user.id;

    // input validations
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields!",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot update profile at moment. Please try again!",
      });
    }

    // fetching the user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please try again!",
      });
    }
    userDetails.firstName = firstName
    userDetails.lastName = lastName
    if(userDetails.image?.split('/')[2] === 'api.dicebear.com'){
      userDetails.image = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    }
    await userDetails.save()

    // fetching profile id from user details
    const profileId = userDetails?.additionalDetails;
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "User profile not found. Please try again!",
      });
    }

    // fetching profile details
    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      return res.status(400).json({
        success: false,
        message: "User profile not found. Please try again!",
      });
    }

    // updating the profile
    profileDetails.contact = contact;
    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    await profileDetails.save();

    // success response
    res.status(200).json({
      success: true,
      message: "Profile updated sucessfully",
      userDetails, profileDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// delete account
exports.deleteAccount = async (req, res) => {
  try {
    // fetching the user id
    const userId = req.user.id;

    // input validations
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account at moment. Please try again!",
      });
    }

    // fetching the user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account at moment. Please try again!",
      });
    }

    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    // deleting the user
    await User.findByIdAndDelete(userId);

    // success response
    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// get all user details
exports.getAllUserDetails = async (req, res) => {
  try {
    // fetching the user id
    const userId = req.user.id;

    // input validations
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot get user details at moment. Please try again!",
      });
    }

    // fetching the user details
    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot get user details at moment. Please try again!",
      });
    }

    // success response
    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// update display picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    // fetching the display picture
    const displayPicture = req?.files?.displayPicture;
    const userId = req.user.id;

    // input validations
    if (!displayPicture) {
      return res.status(400).json({
        success: false,
        message: "Please select a picture!",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot update display picture at moment. Please try again!",
      });
    }

    // fetching the user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot update display picture at moment. Please try again!",
      });
    }
    // uploading the display picture to cloudinary
    const image = await uploadToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Cannot update display picture at moment. Please try again!",
      });
    }

    // updating the user details
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    if (!updatedProfile) {
      return res.status(400).json({
        success: false,
        message: "Cannot update display picture at moment. Please try again!",
      });
    }

    // success response
    res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// get all enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // input validations
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot get enrolled courses at moment. Please try again!",
      });
    }

    // fetching the user details
    const userDetails = await User.findById(userId)
      .populate("courses")
      .exec();

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot get enrolled courses at moment. Please try again!",
      });
    }

    // success response
    res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully",
      data: userDetails.courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
}
