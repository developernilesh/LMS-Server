const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  image: { type: String },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  cartItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  courseProgress: [
    { type: mongoose.Schema.Types.ObjectId, ref: "CourseProgress" },
  ],
  token: { type: String },
  resetPasswordExpiresIn: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema)