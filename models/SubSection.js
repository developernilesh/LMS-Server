const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  timeDuration: { type: String },
  description: { type: String, required: true },
  SubSectionVideo: { type: Object, required: true },
});

module.exports = mongoose.model("SubSection", subSectionSchema);
