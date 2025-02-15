const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// creating rating and review
exports.createRatingAndReview = async (req, res) => {
  try {
    const { rating, review, courseId } = req.body;
    const userId = req.user.id;

    // checking if user is enrolled in the course
    const courseDetails = await Course.findById(courseId);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!courseDetails.studentsEnrolled.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // checking if user has already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "User has already reviewed the course",
      });
    }

    // creating rating and review
    const ratingAndReview = await RatingAndReview.create({
      user: userId,
      course: courseId,
      rating,
      review,
    });

    // update course details
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingAndReview._id,
        },
      },
      { new: true }
    );
    if (!updatedCourseDetails) {
      return res.status(400).json({
        success: false,
        message: "Course not updated",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "Rating and review created successfully",
      ratingAndReview,
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in creating rating and review",
      error: error.message,
    });
  }
};

// getting average rating of a course
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    // getting all reviews of the course
    const allReviews = await RatingAndReview.find({ course: courseId });

    if (!allReviews) {
      return res.status(400).json({
        success: false,
        message: "No ratings and reviews found",
      });
    }

    // getting average rating
    const averageRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      allReviews.length;

    if (!averageRating || averageRating === 0) {
      return res.status(400).json({
        success: false,
        message: "No ratings and reviews found",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "Average rating fetched successfully",
      averageRating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// get all ratings and reviews
exports.getAllRatingsAndReviews = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({ path: "course", select: "courseName" })
      .exec()

    if (!allReviews || allReviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No ratings and reviews found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All ratings and reviews fetched successfully",
      allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching all ratings and reviews",
      error: error.message,
    });
  }
};
