const express = require("express");
const router = express.Router();

// importing middleware
const { auth } = require("../middlewares/auth");

// importing controllers
const {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile");

// ******************************************************************************************************************
//                                      Profile routes
// ******************************************************************************************************************

// update profile
router.put("/update-profile", auth, updateProfile);

// delete account
router.delete("/delete-account", auth, deleteAccount);

// get all user details
router.get("/get-user-details", auth, getAllUserDetails);

// update display picture
router.put("/update-display-picture", auth, updateDisplayPicture);

// get all enrolled courses
router.get("/get-enrolled-courses", auth, getEnrolledCourses);

module.exports = router;
