const ContactUs = require("../models/ContactUs");
const mailSender = require("../utils/MailSender");

// Contact form submission handler
exports.contactUs = async (req, res) => {
  try {
    // Get data from request body
    const { firstName, lastName, email, phoneNo='', message } = req.body;

    // Validate data
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please all the required fields!",
      });
    }

    const contact = await ContactUs.create({
      firstName,
      lastName,
      email,
      phoneNo,
      message,
    });

    // Send email notification
    const emailBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phoneNo}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
    `;

    await mailSender(
      "nileshmukherjee2017@gmail.com", // Replace with your email
      "New Contact Form Submission - LearnVerse",
      emailBody
    );

    // Send confirmation email to the user
    const userEmailBody = `
      <h2>Thank you for contacting LearnVerse!</h2>
      <p>Dear ${firstName},</p>
      <p>We have received your message and will get back to you soon.</p>
      <p>Here's a copy of your message: ${message}</p>
      <br/>
      <p>Best regards,</p>
      <p>LearnVerse Team</p>
    `;

    await mailSender(
      email,
      "Thank you for contacting LearnVerse",
      userEmailBody
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error?.message}`,
    });
  }
};
