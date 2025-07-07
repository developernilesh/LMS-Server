// instantiating express app
const express = require("express");
const app = express();
require("dotenv").config();

// ----------------------------------------------------
// GLOBAL ERROR HANDLERS - Place these at the very top
// This will catch any unhandled synchronous errors or promise rejections
// that occur outside of your Express route/middleware chain.
// ----------------------------------------------------
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message, err.stack);
  // Log the error details here (e.g., to an external logging service)
  // Render's logs will capture this console.error as well.
  // It's crucial to exit the process after an uncaught exception
  // to prevent the application from being in an undefined state.
  process.exit(1); // Exit with a failure code. Render will likely restart your service.
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error("At:", promise, "Reason:", reason);
  // Log the error details here.
  // For unhandled rejections, you might choose to exit or not,
  // depending on the severity. Exiting is generally safer for production
  // to prevent the application from continuing with an inconsistent state.
  process.exit(1); // Exiting here to be safe; Render will restart.
});
// ----------------------------------------------------
// END GLOBAL ERROR HANDLERS
// ----------------------------------------------------

// importing middleware
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// importing routes
const authRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const contactRoutes = require("./routes/ContactUs");

// connecting to database
const { dbConnect } = require("./config/database");
dbConnect();

// cloudinary connection
const { cloudinaryConnect } = require("./config/cloudinary");
cloudinaryConnect();

// middleware
app.use(express.json());
app.use(cookieParser());
// Ensure FRONTEND_URL is correctly set in your Render environment variables
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp", // Ensure /tmp exists and is writable in Render's environment
  })
);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactRoutes);

// Custom Express Error handling middleware (for errors passed to next(err))
// This should be the last middleware after all your routes.
// It catches errors explicitly passed to `next(err)` by other middleware or routes.
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack);
  // Check if headers have already been sent to prevent "Cannot set headers after they are sent" error
  if (res.headersSent) {
    return next(err); // Pass to default error handler or let Node handle it
  }
  // Default error response for unhandled errors in the Express chain
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined, // Provide stack in dev, not prod
  });
});

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

// server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // ----------------------------------------------------
  // Memory Usage Logging (for development/debugging)
  // ONLY include this in non-production environments to avoid overhead
  // You can remove this or comment it out for your final production deployment.
  // ----------------------------------------------------
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      console.log("--- Memory Usage Report ---");
      console.log(
        `  RSS: ${Math.round(
          memUsage.rss / 1024 / 1024
        )} MB (Resident Set Size)`
      );
      console.log(
        `  Heap Total: ${Math.round(
          memUsage.heapTotal / 1024 / 1024
        )} MB (V8 Heap Total)`
      );
      console.log(
        `  Heap Used: ${Math.round(
          memUsage.heapUsed / 1024 / 1024
        )} MB (V8 Heap Used)`
      );
      console.log(
        `  External: ${Math.round(
          memUsage.external / 1024 / 1024
        )} MB (C++ objects outside V8 heap)`
      );
      console.log(
        `  Array Buffers: ${Math.round(
          memUsage.arrayBuffers / 1024 / 1024
        )} MB (Memory for ArrayBuffers)`
      );
      console.log("---------------------------");
    }, 5 * 60 * 1000); // Log every 5 minutes (adjust as needed for debugging)
  }
});
