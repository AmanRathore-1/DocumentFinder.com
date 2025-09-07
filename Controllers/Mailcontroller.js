const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// POST /api/contact
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // sender
      replyTo: email, // reply goes to user
      to: process.env.EMAIL_USER, // your email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>Contact Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/> ${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "✅ Your message has been sent!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: " Failed to send message" });
  }
});

module.exports = router;
