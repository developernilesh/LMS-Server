const Course = require("../models/Course");
const User = require("../models/User");

exports.addToCart = async (req, res) => {
  try {
    // fetching data from request
    const { courseId } = req.body;
    const userId = req.user.id;

    // validations
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot add course to cart at moment. Please try again!",
      })
    }

    // fetching course details
    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot add course to cart at moment. Please try again!",
      })
    }

    // fetching user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot add course to cart at moment. Please try again!",
      })
    }

    // checking if course is already in cart
    if (userDetails.cartItems.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course already in cart!",
      });
    }

    // adding course to cart
    userDetails.cartItems.push(courseId);
    const addedToCart = await userDetails.save();
    if (!addedToCart) {
      return res.status(400).json({
        success: false,
        message: "Cannot add course to cart at moment. Please try again!",
      });
    }

    // returning success response
    return res.status(200).json({
      success: true,
      message: "Course added to cart successfully!",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    // fetching data from request
    const { courseId } = req.body;
    const userId = req.user.id;

    // validations
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove course from cart at moment. Please try again!",
      })
    }

    // fetching course details
    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove course from cart at moment. Please try again!",
      })
    }

    // fetching user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove course from cart at moment. Please try again!",
      })
    }

    // checking does the course actually exist in cart
    if (!userDetails.cartItems.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "There is no course in cart!",
      });
    }

    // removing course from cart
    userDetails.cartItems = userDetails.cartItems.filter((item) => item.toString() !== courseId)
    const updatedCart = await userDetails.save();
    if (!updatedCart) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove course from cart at moment. Please try again!"
      })
    }

    // returning success response
    return res.status(200).json({
      success: true,
      message: "Course removed from cart successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

exports.getCartItems = async (req, res) => {
  try {
    // fetching data from request
    const userId = req.user.id;

    // validations
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot get cart items at moment. Please try again!",
      })
    }

    // fetching user details
    const userDetails = await User.findById(userId)
      .populate({ 
        path: "cartItems",
        select: "courseName courseDescription price thumbNail instructorPromise tags",
        populate: [
          {
            path: "instructor",
            select: "firstName lastName email image"
          },
          {
            path: "ratingAndReview",
            select: "rating review"
          }
        ]
      })
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot get cart items at moment. Please try again!",
      })
    }
    
    // returning success response
    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully!",
      data: userDetails.cartItems
    }) 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

exports.clearCart = async (req, res) => { 
  try {
    // fetching data from request
    const userId = req.user.id;

    // validations
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot clear cart at moment. Please try again!",
      })
    }

    // fetching user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot clear cart at moment. Please try again!",
      })
    }

    // checking is the cart empty
    if (userDetails.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There is no course in cart!",
      });
    }

    // clearing cart
    userDetails.cartItems = [];
    const updatedCart = await userDetails.save();
    if (!updatedCart) {
      return res.status(400).json({
        success: false,
        message: "Cannot clear cart at moment. Please try again!",
      })
    }

    // returning success response
    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
};

// enrolling to a course
exports.enrollToCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // validations
    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in course at moment. Please try again!",
      })
    }

    // fetching course details
    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in course at moment. Please try again!",
      })
    }

    // fetching user details
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in course at moment. Please try again!",
      })
    }

    // checking if the course is already enrolled
    if (userDetails.courses.includes(courseId) && courseDetails.studentsEnrolled.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course!",
      })
    }

    // enrolling to the course
    userDetails.courses.push(courseId);
    const updatedUser = await userDetails.save();
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in course at moment. Please try again!",
      })
    } 

    // updating course details
    courseDetails.studentsEnrolled.push(userId);
    const updatedCourse = await courseDetails.save();
    if (!updatedCourse) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in course at moment. Please try again!",
      })
    }

    // if the course is present in the cart, remove it from the cart
    if (userDetails.cartItems.includes(courseId)) {
      userDetails.cartItems = userDetails.cartItems.filter((item) => item.toString() !== courseId);
      await userDetails.save();
    }

    // returning success response
    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course!",
    });     
  } catch (error) { 
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    })
  }
}

