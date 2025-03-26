const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  contact: { type: String, trim: true },
  gender: { type: String, trim: true },
  dateOfBirth: { type: String },
  about: { type: String, trim: true },
});

module.exports = mongoose.model("Profile", profileSchema);