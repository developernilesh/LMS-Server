const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require('otp-generator')

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
    const { email } = req.body;
    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }
    let otp = generateOTP();
    let alreadyExistingOtp = await OTP.findOne({ otp: otp })
    while (alreadyExistingOtp) {
      otp = generateOTP();
      alreadyExistingOtp = await OTP.findOne({ otp: otp })
    }
    const otpPayload = { email, otp }
    // create an entry in DB for OTP
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
  const { firstName, lastName, email, password, confirmPassword, accountType, contact, otp } = req.body
  if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contact || !otp) {
    res.status(403).json({
      success: false,
      message: "Please fill all the required fileds"
    })
  }
  if (password !== confirmPassword) {
    res.status(400).json({
      success: false,
      message: "Confirm password doesn't match the original passowrd. Please try again!"
    })
  }
  const isExistingUser = await User.findOne({ email });
  if (isExistingUser) {
    return res.status(401).json({
      success: false,
      message: "User already registered",
    });
  }
  const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1)
  if(!recentOTP.length){
    return res.status(401).json({
      success: false,
      message: "OTP is not valid",
    });
  }
}

// Login

// Change Passowrd
