const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    //transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    //send mail
    await transporter.sendMail({
      from: `LearnVerse`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = mailSender;
