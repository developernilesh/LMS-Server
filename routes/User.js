const express = require("express");
const router = express.Router();

// importing middleware
const { auth } = require("../middlewares/auth");

// importing controllers
const {
  login,
  signUp,
  logout,
  sendOTP,
  changePassword,
} = require("../controllers/Auth");
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");


// ******************************************************************************************************************
//                                      Authentication routes
// ******************************************************************************************************************

// Login route
router.post("/login", login);

// signUp route
router.post("/signup", signUp);

// Logout route
router.post("/logout", logout);

// send OTP route
router.post("/send-otp", sendOTP);

// change password route
router.post("/change-password", auth, changePassword);

// ******************************************************************************************************************
//                                      Reset Password routes
// ******************************************************************************************************************

// generate reset password token
router.post("/reset-password-token", resetPasswordToken);

// reset password
router.post("/reset-password", resetPassword);

// Exporting the router
module.exports = router;
