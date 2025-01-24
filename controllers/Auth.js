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
  // fetching data from request's body
  const { firstName, lastName, email, password, confirmPassword, accountType, contact, otp } = req.body

  // validations for input fields
  if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contact || !otp) {
    res.status(403).json({
      success: false,
      message: "Please fill all the required fileds"
    })
  }

  // checking if confirm password matches original passowrd
  if (password !== confirmPassword) {
    res.status(400).json({
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
  const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1)

  // validation for the otp
  if(!recentOTP.length || otp!==recentOTP.otp){
    return res.status(401).json({
      success: false,
      message: "OTP is not valid",
    });
  }
  
  // passowrd hashing
}

// Login

// Change Passowrd
