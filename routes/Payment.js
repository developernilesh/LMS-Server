const express = require("express");
const router = express.Router();

// importing middleware
const { auth, isStudent } = require("../middlewares/auth");

// importing controllers
const { capturePayment, verifyPayment } = require("../controllers/Payment");

// ******************************************************************************************************************
//                                      Payment routes
// ******************************************************************************************************************

// capturing payment
router.post("/capture-payment", auth, isStudent, capturePayment);

// verifying payment
router.post("/verify-payment", verifyPayment);

module.exports = router;