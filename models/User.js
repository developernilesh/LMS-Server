const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  contact: { type: Number, required: true },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  image: { type: String, required: true },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  courseProgress: [
    { type: mongoose.Schema.Types.ObjectId, ref: "CourseProgress" },
  ],
  token: { type: String },
  resetPasswordExpiresIn: { type: Date },
});

module.exports = mongoose.model("User", userSchema)