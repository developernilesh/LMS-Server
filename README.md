# LearnVerse LMS Server

LearnVerse is a Learning Management System (LMS) backend built with Node.js, Express, and MongoDB. It provides APIs for user authentication, course management, payments, reviews, and more.

## Features

- **User Authentication:** Signup, login, logout, password reset, and role-based access (Admin, Student, Instructor).
- **Profile Management:** Update profile, display picture, and view enrolled courses.
- **Course Management:** Instructors can create, edit, publish, and delete courses, sections, and subsections.
- **Category Management:** Admins can create and manage course categories.
- **Cart System:** Students can add/remove courses to/from cart and clear cart.
- **Payment Integration:** Razorpay integration for course payments, with payment verification and email notifications.
- **Ratings & Reviews:** Students can rate and review courses.
- **Contact Us:** Contact form with email notifications.
- **Email Notifications:** OTP verification, password updates, course enrollment, and payment confirmations via email (using Nodemailer and Cloudinary for media).

## Project Structure

```
.env
index.js
package.json
config/
  cloudinary.js
  database.js
  razorpay.js
controllers/
  Auth.js
  Cart.js
  Category.js
  ContactUs.js
  Course.js
  Payment.js
  Profile.js
  RatingAndReviews.js
  ResetPassword.js
  Section.js
  SubSection.js
mail/
  templates/
middlewares/
  auth.js
models/
  Category.js
  ContactUs.js
  Course.js
  CourseProgress.js
  OTP.js
  Profile.js
  RatingAndReview.js
  Section.js
  SubSection.js
  User.js
routes/
  ContactUs.js
  Course.js
  Payment.js
  Profile.js
  User.js
utils/
  ImageUploader.js
  MailSender.js
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance
- Cloudinary account (for media uploads)
- Razorpay account (for payments)

### Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory with the following variables:

    ```
    PORT=4000
    MONGODB_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    FRONTEND_URL=your_frontend_url
    CLOUD_NAME=your_cloudinary_cloud_name
    API_KEY=your_cloudinary_api_key
    API_SECRET=your_cloudinary_api_secret
    MAIL_HOST=your_smtp_host
    MAIL_USER=your_smtp_user
    MAIL_PASS=your_smtp_password
    RAZORPAY_KEY=your_razorpay_key
    RAZORPAY_SECRET=your_razorpay_secret
    FOLDER_NAME=your_cloudinary_folder_name
    ```

4. Start the server:

    ```
    npm run dev
    ```

    The server will run on `http://localhost:4000` by default.

## API Endpoints

### Auth (`/api/v1/auth`)
- `POST /login` - User login
- `POST /signup` - User signup
- `POST /logout` - User logout
- `POST /send-otp` - Send OTP for email verification
- `POST /change-password` - Change password
- `POST /reset-password-token` - Request password reset
- `POST /reset-password` - Reset password

### Profile (`/api/v1/profile`)
- `PUT /update-profile` - Update user profile
- `DELETE /delete-account` - Delete user account
- `GET /get-user-details` - Get user details
- `PUT /update-display-picture` - Update profile picture
- `GET /get-enrolled-courses` - Get enrolled courses

### Course (`/api/v1/course`)
- Instructor routes: create, edit, delete, publish courses, add/update/delete sections and subsections
- Student routes: add/remove/clear cart, mark/unmark lecture as complete
- Public routes: get all courses, get course details, get categories, get ratings and reviews

### Payment (`/api/v1/payment`)
- `POST /capture-payment` - Initiate payment
- `POST /verify-payment` - Verify payment and enroll user
- `POST /payment-successful-email` - Send payment confirmation email

### Contact (`/api/v1/contact`)
- `POST /contact-us` - Submit contact form

## Technologies Used

- **Node.js** & **Express** for server and routing
- **MongoDB** & **Mongoose** for database and ODM
- **JWT** for authentication
- **Nodemailer** for sending emails
- **Cloudinary** for media uploads
- **Razorpay** for payment processing

## License

This project is licensed under the ISC License.

---

**Note:** Update email addresses and sensitive information in the code and `.env` as per your requirements.
