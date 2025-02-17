const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile")
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();
const mailSender = require("../utils/MailSender")
const passwordUpdated = require("../mail/templates/passwordUpdate")

const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  })
}

// send OTP
exports.sendOTP = async (req, res) => {
  try {
    // fetching data from request's body
    const { email } = req.body;

    // checking if user already exists
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // generating a unique otp
    let otp = generateOTP();
    let alreadyExistingOtp = await OTP.findOne({ otp: otp })
    while (alreadyExistingOtp) {
      otp = generateOTP();
      alreadyExistingOtp = await OTP.findOne({ otp: otp })
    }

    // create an entry in DB for OTP
    const otpPayload = { email, otp }
    const generatedOTP = await OTP.create(otpPayload)
    if (!generatedOTP) {
      return res.status(400).json({
        success: false,
        message: "Failed to send OTP"
      })
    }
    console.log("generatedOTP : ", generatedOTP)

    // returning response
    res.status(200).json({
      success: true,
      message: "Otp sent successfully",
      otp
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};

// Signup
exports.signUp = async (req, res) => {
  try {
    // fetching data from request's body
    const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body

    // validations for input fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fileds"
      })
    }

    // checking if confirm password matches original passowrd
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password doesn't match the original passowrd. Please try again!"
      })
    }

    // checking if user already exists
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // finding most recent otp for the user
    const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)

    // validation for the otp
    if (!recentOTP.length || otp !== recentOTP[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not valid",
      });
    }

    // passowrd hashing
    const hashedPassword = await bcrypt.hash(password, 10)

    // creating entry in DB
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
    })

    const userDetails = await User.create({
      firstName, lastName, email, password: hashedPassword, accountType, additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })

    // sending response
    res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      userDetails
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Login
exports.login = async (req, res) => {
  try {
    // fetching data from request's body
    const { email, password } = req.body

    // validation for the inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fileds"
      })
    }

    // cheching if user exists
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered"
      })
    }

    // verifying the entered password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect Password'
      });
    }

    // generating a JWT token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    }
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Cannot login! Please try again."
      })
    }
    user["token"] = token;
    user["password"] = null;

    // generating cookie
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }
    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: 'User logged in successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// logout
exports.logout = async (req, res) => {
  try {
    // clearing the cookie
    res.clearCookie("token");

    // returning response
    res.status(200).json({
      success: true,
      message: "User logged out successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
}

// Change Passowrd
exports.changePassword = async (req, res) => {
  try {
    // fetching data from req body
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body

    // validations for input fileds
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the required fileds"
      })
    }

    // other validations
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password doesn't match the original passowrd. Please try again!"
      })
    }

    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Cannot change password! Please try again."
      })
    }

    // checking if the entered old password is wrong
    if (!await bcrypt.compare(oldPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "You have enterd wrong old passowrd"
      })
    }

    // checking if new password is same as old password
    if (newPassword === oldPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as old password"
      })
    }

    // updating passowrd in database
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    if (!hashedNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Failed to update the new password. Please try again.",
      });
    }
    user["password"] = hashedNewPassword

    const updatedUser = await User.findByIdAndUpdate(user._id, { ...user }, { new: true })
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the password. Please try again.",
      });
    }

    // sending mail - Passowrd Update
    await mailSender(
      updatedUser.email,
      "Password Update Confirmation",
      passwordUpdated(
        updatedUser.email,
        `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
      )
    )

    // returning response
    res.status(200).json({
      success: true,
      message: "Password updated successfully!"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}