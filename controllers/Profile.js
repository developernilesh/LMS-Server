const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    // fetching data from req body
    const { contact, gender, dateOfBirth = "", about = "" } = req.body
    const userId = req.user.id

    // input validations
    if(!contact || !gender){
      return res.status(401).json({
        success: false,
        message: "Please fill the required fields!"
      })
    }
    if(!userId){
      return res.status(401).json({
        success: false,
        message: "Cannot update profile at moment. Please try again!"
      })
    }

    // fetching the user details
    const userDetails = await User.findById(userId)
    if(!userDetails){
      return res.status(401).json({
        success: false,
        message: "User not found. Please try again!"
      })
    }

    // fetching profile id from user details
    const profileId = userDetails?.additionalDetails
    if(!profileId){
      return res.status(401).json({
        success: false,
        message: "User profile not found. Please try again!"
      })
    }

    // fetching profile details
    const profileDetails = await Profile.findById(profileId)
    if(!profileDetails){
      return res.status(401).json({
        success: false,
        message: "User profile not found. Please try again!"
      })
    }

    // updating the profile
    profileDetails.contact = contact
    profileDetails.gender = gender
    profileDetails.dateOfBirth = dateOfBirth
    profileDetails.about = about
    await profileDetails.save()

    // success response
    res.status(200).json({
      success: true,
      message: "Profile updated sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
