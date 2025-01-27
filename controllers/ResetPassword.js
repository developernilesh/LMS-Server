const User = require("../models/User");
const mailSender = require("../utils/MailSender");

// generate token
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetching email from request body
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Please enter your email to reset password!",
      });
    }

    // checking if user exists for the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
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
    if(!updatedUser){
      return res.status(401).json({
        success: false,
        message: "Cannot reset password. Please try again!",
      });
    }

    // creating the unique url
    const url = `http://localhost:3000/update-password/${token}`

    // sending mail containing the url
    await mailSender(email, "Password reset link", `Passowrd reset link : ${url}`);

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
