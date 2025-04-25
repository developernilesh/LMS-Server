const express = require("express");
const router = express.Router();

// importing middleware
const { auth, isStudent, isInstructor, isAdmin } = require("../middlewares/auth");

// importing controllers
const { createCourse, getCourseDetails, showAllCourses } = require("../controllers/Course");
const { createSection, updateSection, deleteSection } = require("../controllers/Section");
const { createSubSection, updateSubSection, deleteSubSection } = require("../controllers/SubSection");
const { createCategory, showAllCategories, categoryPageDetails } = require("../controllers/Category");
const { createRatingAndReview, getAverageRating, getAllRatingsAndReviews } = require("../controllers/RatingAndReviews");
const { addToCart, removeFromCart, getCartItems, clearCart, enrollToCourse } = require("../controllers/Cart");

// ******************************************************************************************************************
//                                      Course routes
// ******************************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/create-course", auth, isInstructor, createCourse);

// Adding a section to a course
router.post("/add-section", auth, isInstructor, createSection);

// Updating a section
router.put("/update-section", auth, isInstructor, updateSection);

// Delete a section
router.delete("/delete-section", auth, isInstructor, deleteSection);

// adding a sub-section to a section
router.post("/add-sub-section", auth, isInstructor, createSubSection);

// updating a sub-section
router.put("/update-sub-section", auth, isInstructor, updateSubSection);

// deleting a sub-section
router.delete("/delete-sub-section", auth, isInstructor, deleteSubSection);

// getting all courses
router.get("/get-all-courses", showAllCourses);

// getting Details for a Specific Courses
router.get("/get-courses-details/:courseId", getCourseDetails);

// ******************************************************************************************************************
//                                      Category routes (only for Admin)
// ******************************************************************************************************************

// creating a category
router.post("/create-category", auth, isAdmin, createCategory);

// getting all categories
router.get("/get-all-categories", showAllCategories);

// getting category page details
router.get("/get-category-page-details", categoryPageDetails);

// ******************************************************************************************************************
//                                      Cart routes (only for Student)
// ******************************************************************************************************************

// adding a course to cart
router.post("/add-to-cart", auth, isStudent, addToCart);

// removing a course from cart
router.post("/remove-from-cart", auth, isStudent, removeFromCart);

// getting all courses in cart
router.get("/get-cart-items", auth, isStudent, getCartItems);

// clearing the cart
router.post("/clear-cart", auth, isStudent, clearCart);

// enrolling to a course
router.post("/enroll-to-course", auth, isStudent, enrollToCourse);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************

// creating a rating and review
router.post("/add-rating-and-review", auth, isStudent, createRatingAndReview);

// getting average rating and review
router.get("/get-average-rating", getAverageRating);

// getting all ratings and reviews
router.get("/get-all-ratings-and-reviews", getAllRatingsAndReviews);

module.exports = router;