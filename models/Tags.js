const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  user: { type: String, required: true, trim: true, },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref:"Course" },
});

module.exports = mongoose.model("Tag", tagSchema);