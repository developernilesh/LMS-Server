const { razorpayInstance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

exports.capturePayment = async (req, res) => {
  try {
    // fetching courseId and userId
    const userId = req.user.id
    const { courseId } = req.body

    // input validations
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Cannot fetch user details. Please try again!",
      });
    }
    if (!courseId) {
      return res.status(401).json({
        success: false,
        message: "Cannot fetch course details. Please try again!",
      });
    }

    // courseDetails validation
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(401).json({
        success: false,
        message: "Cannot fetch course details. Please try again!",
      })
    }

    // checking if user already paid for this course
    const uid = new mongoose.Types.ObjectId(userId)
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(401).json({
        success: false,
        message: "Student is already enrolled in this course",
      })
    }

    // razorpay order creation
    const coursePrice = course.price
    const currency = "INR"
    const options = {
      amount: coursePrice * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: { courseId, userId }
    }
    const paymentDetails = await razorpayInstance.orders.create(options)
    if(!paymentDetails){
      return res.status(401).json({
        success: false,
        message: "Could not initiate payment. Please try again!",
      })
    }

    // success response
    res.status(200).json({
      success: true,
      message: "Payment Successful!",
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbNail: course.validate,
      orderId: paymentDetails.id,
      currency: paymentDetails.currency,
      amount: paymentDetails.amount
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};
