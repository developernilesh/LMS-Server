const express = require("express");
const router = express.Router();
const { contactUs } = require("../controllers/ContactUs");

// ******************************************************************************************************************
//                                      Contact routes
// ******************************************************************************************************************

router.post("/contact-us", contactUs);

module.exports = router;
