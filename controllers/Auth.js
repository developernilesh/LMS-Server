const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require('otp-generator')

const generateOTP = () => {
    return otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })
}

// send OTP
const sendOTP = async (req, res) => {
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
    let alreadyExistingOtp = await OTP.findOne({otp: otp})
    while(alreadyExistingOtp){
        otp = generateOTP();
        alreadyExistingOtp = await OTP.findOne({otp: otp})
    }
    const otpPayload = {email, otp}
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

// Login

// Change Passowrd
