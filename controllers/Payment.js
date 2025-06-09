const { razorpayInstance } = require("../config/razorpay");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const crypto = require("crypto");
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
    console.log("err", error);
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
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
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

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong while enrollment!",
      });
    }

    // sending confirmation mail
    await mailSender(
      userDetails?.email,
      "Congratulations from LearnVerse!",
      "Congratulations, you are onboarded into new LearnVerse Course"
    );

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

exports.paymentInitiationEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user?.id;

    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent?.email,
      "Congratulations from LearnVerse!",
      paymentSuccessEmail(
        `${enrolledStudent?.firstName} ${enrolledStudent?.lastName}`,
        `${parseFloat(amount) / 100}`,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.error(error);
  }
};