const mongoose = require("mongoose");

const courseScehma = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  courseDescription: { type: String, trim: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  whatYouWillLearn: { type: String, trim: true },
  courseContent: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  ],
  ratingAndReview: [
    { type: mongoose.Schema.Types.ObjectId, ref: "RatingAndReview" },
  ],
  price: { type: Number, required: true },
  thumbNail: { type: Object, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  tags: { type: [String] },
  studentsEnrolled: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],
	instructions: {
		type: [String],
	},
	status: {
		type: String,
		enum: ["Draft", "Published"],
	},
}, { timestamps: true });

module.exports = mongoose.model("Course", courseScehma);
