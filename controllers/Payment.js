const { razorpayInstance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const mongoose = require("mongoose");
require("dotenv").config();

exports.capturePayment = async (req, res) => {
  try {
    const { courseIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(courseIds) || courseIds.length === 0 || !userId) {
      return res.status(400).json({
        success: false,
        message: "Could not initiate payment. Please try again!",
      });
    }

    // Fetch user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    let totalAmount = 0;
    for (const courseId of courseIds) {
      const courseDetails = await Course.findById(courseId);
      if (!courseDetails) continue;
      if (
        courseDetails.studentsEnrolled.includes(userId) ||
        userDetails.courses.includes(courseId)
      )
        continue;
      totalAmount += parseFloat(courseDetails?.price);
    }

    if (totalAmount === 0) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in all selected courses.",
      });
    }

    const currency = "INR";
    const courses = JSON.stringify(courseIds);
    const options = {
      amount: totalAmount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: { courses, userId },
    };

    const paymentDetails = await razorpayInstance.orders.create(options);
    if (!paymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Could not initiate payment. Please try again!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment Initiated Successfully!",
      paymentDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = req?.body?.razorpayOrderid;
    const razorpay_payment_id = req?.body?.razorpayPaymentId;
    const razorpay_signature = req?.body?.razorpaySignature;
    const courses = req?.body?.courses;
    const userId = req?.user?.id;

    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      courses?.length < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment Failed. Please try again!",
      });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment Failed. Please try again!",
      });
    }

    const errors = [];
    for (const courseId of courses) {
      const courseDetails = await Course.findById(courseId);
      if (!courseDetails) {
        errors.push(courseId);
        continue;
      }

      // Check if already enrolled
      if (
        userDetails.courses.includes(courseId) ||
        courseDetails.studentsEnrolled.includes(userId)
      )
        continue;

      // Enroll user
      userDetails.courses.push(courseId);
      courseDetails.studentsEnrolled.push(userId);

      // Remove from cart if present
      if (userDetails.cartItems.includes(courseId)) {
        userDetails.cartItems = userDetails.cartItems.filter(
          (item) => item.toString() !== courseId
        );
      }
      await courseDetails.save();
    }
    await userDetails.save();

    if(errors.length > 0){
      return res.status(400).json({
        success: false,
        message: "Something went wrong while enrollment!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment process completed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};

exports.capturePayment_old = async (req, res) => {
  try {
    // fetching courseId and userId
    const userId = req.user.id;
    const { courseId } = req.body;

    // input validations
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot fetch user details. Please try again!",
      });
    }
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Cannot fetch course details. Please try again!",
      });
    }

    // courseDetails validation
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Cannot fetch course details. Please try again!",
      });
    }

    // checking if user already paid for this course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }

    // razorpay order creation
    const coursePrice = course.price;
    const currency = "INR";
    const options = {
      amount: coursePrice * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: { courseId, userId },
    };
    const paymentDetails = await razorpayInstance.orders.create(options);
    if (!paymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Could not initiate payment. Please try again!",
      });
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
      amount: paymentDetails.amount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};

exports.verifyPayment_old = async (req, res) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];

    // verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // checking if payment is valid
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment not verified. Please try again!",
      });
    }

    // fetching course and user id from notes
    const order = req.body.payload.payment.entity;
    const { courseId, userId } = order.notes;

    // enrolling student in the course
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );
    if (!enrolledCourse) {
      return res.status(400).json({
        success: false,
        message: "Course not found!",
      });
    }

    // updating user enrolled courses
    const enrolledStudent = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { courses: courseId } },
      { new: true }
    );
    if (!enrolledStudent) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // sending confirmation mail
    await mailSender(
      enrolledStudent.email,
      "Congratulations from LearnVerse!",
      "Congratulations, you are onboarded into new LearnVerse Course"
    );

    // success response
    res.status(200).json({
      success: true,
      message: "Payment verified and course added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};
