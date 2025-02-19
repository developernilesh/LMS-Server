const mongoose = require("mongoose");
const mailSender = require("../utils/MailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate")

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, },
  otp: { type: String, required: true },
  createdAt: { type: Date, default:Date.now(), expires: 5*60 },
});

const sendVerificationMail = async(email,otp) => {
  try {
    await mailSender(email,"Verification email from LearnVerse",emailTemplate(otp))
  } catch (error) {
    throw `Error occured while sending verification email ${error}`
  }
}

OtpSchema.pre("save", async function(next) {
  try {
    await sendVerificationMail(this.email, this.otp);
    next();
  } catch (error) {
    throw `Error occured while sending verification email ${error}`
  }
})

module.exports = mongoose.model("OTP", OtpSchema);