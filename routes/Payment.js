const express = require("express");
const router = express.Router();

// importing middleware
const { auth, isStudent } = require("../middlewares/auth");

// importing controllers
const { capturePayment, verifyPayment, paymentInitiationEmail } = require("../controllers/Payment");

// ******************************************************************************************************************
//                                      Payment routes
// ******************************************************************************************************************

// capturing payment
router.post("/capture-payment", auth, isStudent, capturePayment);

// verifying payment
router.post("/verify-payment", auth, isStudent, verifyPayment);

// payment successful email
router.post("/payment-successful-email", auth, isStudent, paymentInitiationEmail);

module.exports = router;