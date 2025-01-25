const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile")
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();

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
      return res.status(401).json({
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
    const { firstName, lastName, email, password, confirmPassword, accountType, contact, otp } = req.body

    // validations for input fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contact || !otp) {
      return res.status(401).json({
        success: false,
        message: "Please fill all the required fileds"
      })
    }

    // checking if confirm password matches original passowrd
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Confirm password doesn't match the original passowrd. Please try again!"
      })
    }

    // checking if user already exists
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    // finding most recent otp for the user
    const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)

    // validation for the otp
    if (!recentOTP.length || otp !== recentOTP.otp) {
      return res.status(401).json({
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
      firstName, lastName, email, password: hashedPassword, contact, accountType, additionalDetails: profileDetails._id,
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
      return res.status(401).json({
        success: false,
        message: "Please fill all the required fileds"
      })
    }

    // cheching if user exists
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered"
      })
    }

    // verify password and generate a JWT token
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.accountType,
      }
      let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' })
      user["token"] = token;
      user["password"] = undefined;

      // generate cookie
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
    } else {
      // password does not match
      return res.status(401).json({
        success: false,
        message: 'Incorrect Password'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Change Passowrd
