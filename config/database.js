const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => console.log("DB connection successful"))
      .catch((error) => {
        console.log("Issue in DB connection", error);
        process.exit(1);
      });
  } catch (error) {
    console.log("Error in DB connection", error);
    process.exit(1);
  }
};
