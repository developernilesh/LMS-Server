const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = (req, res, next) => {
  try {
    // fetching the token
    const token = req.header("Authorization").replace("Bearer ", "") || req.cookies.token || req.body.token;

    // checking if token exists
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is missing",
      });
    }

    // validating the token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(400).json({
        successs: false,
        message: "token is invalid",
      });
    }
    req.user = decode;

    // allowing to go to the next middleware
    next();
  } catch (error) {
    return res.status(401).json({
      successs: false,
      message: "Session Expired!",
      error: `Auth error: ${error.message || "Error can't be found"}`,
    });
  }
};

// is Student?
exports.isStudent = (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(400).json({
        success: false,
        message: "This is a protected route for students",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "User role cannot be verified. Please try again!",
    });
  }
};

// is Instructor?
exports.isInstructor = (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "This is a protected route for Instructors",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "User role cannot be verified. Please try again!",
    });
  }
};

// is Admin?
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "This is a protected route for Admins",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "User role cannot be verified. Please try again!",
    });
  }
};
