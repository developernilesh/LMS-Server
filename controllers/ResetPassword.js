const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// generate token
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetching email from request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email to reset password!",
      });
    }

    // checking if user exists for the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Your email is not registered here.",
      });
    }

    // generating token
    const token = crypto.randomUUID();

    // updating user by adding token and its expiration time
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { token, resetPasswordExpiresIn: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Cannot reset password. Please try again!",
      });
    }

    // creating the unique url
    const url = `http://localhost:3000/update-password/${token}`

    // sending mail containing the url
    await mailSender(email, "Password reset link", `Password reset link : ${url}`);

    // returning response
    res.status(200).json({
      success: true,
      message: "Email sent successfully. Please check email and change password."
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while sending mail for reset password"
    })
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    // fetching data from req body
    const { resetPassword, confirmResetPassword, token } = req.body;

    // validations
    if (!resetPassword || !confirmResetPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fileds!",
      });
    }

    if (resetPassword !== confirmResetPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password doesn't match the original Password. Please try again!"
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Cannot reset password. Please try again!",
      });
    }

    // fetching user on the basis of token
    const user = await User.findOne({ token })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Cannot fetch userdetails. Please try again!",
      });
    }

    // expiry time validation of the token
    if (user.resetPasswordExpiresIn < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please try again!",
      });
    }

    // hashing the password
    const hashedResetPassword = await bcrypt.hash(resetPassword, 10)
    if (!hashedResetPassword) {
      return res.status(400).json({
        success: false,
        message: "Failed to reset password. Please try again!",
      });
    }

    // updating the password of the user in db
    const resetUserPassword = await User.findOneAndUpdate({ token }, { password: hashedResetPassword }, { new: true })
    if (!resetUserPassword) {
      return res.status(400).json({
        success: false,
        message: "Failed to reset password. Please try again!",
      });
    }

    // success rensponse
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}