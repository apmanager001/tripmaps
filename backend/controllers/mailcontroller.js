const User = require("../model/user.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Send email verification
const sendEmailVerification = async (req, res) => {
  try {
    const { email, isResend = false } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Set token expiration (24 hours from now)
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Save token to user
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const logoUrl = `${process.env.FRONTEND_URL}/tripmap.webp`;

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content based on whether it's a resend or initial registration
    let subject, htmlContent;

    if (isResend) {
      // Resend email template
      subject = "Email Verification Reminder - TripMaps";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="TripMaps Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Email Verification Reminder</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hello ${user.username},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We noticed that your email address hasn't been verified yet. To access all features of TripMaps and ensure the security of your account, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">Verify Email Address</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If you're having trouble clicking the button, copy and paste this link into your browser:
            </p>
            
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this verification email, please ignore this message.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The TripMaps Team</strong>
            </p>
          </div>
        </div>
      `;
    } else {
      // Initial registration email template
      subject = "Welcome to TripMaps - Verify Your Email";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="TripMaps Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Welcome to TripMaps! 🗺️</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hello ${user.username},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining TripMaps! We're excited to have you as part of our community of travelers and map creators.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              To complete your registration and start creating amazing trip maps, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">Verify Email & Get Started</a>
            </div>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <p style="color: #1e40af; font-size: 14px; margin: 0;">
                <strong>What's next?</strong> After verifying your email, you can:
              </p>
              <ul style="color: #1e40af; font-size: 14px; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Create your first trip map</li>
                <li>Add points of interest</li>
                <li>Share your adventures with friends</li>
                <li>Discover amazing places from other travelers</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              <strong>Security note:</strong> This verification link will expire in 24 hours.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              If you didn't create an account with TripMaps, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Happy mapping!<br>
              <strong>The TripMaps Team</strong>
            </p>
          </div>
        </div>
      `;
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error in sendEmailVerification:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending verification email",
    });
  }
};

// Forgot password - send reset email
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiration (1 hour from now)
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const logoUrl = `${process.env.FRONTEND_URL}/tripmap.webp`;

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: "smtp.zoho.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - TripMaps",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="TripMaps Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Password Reset Request 🔐</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hello ${user.username},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset the password for your TripMaps account. If this was you, please click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">Reset Password</a>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>Security reminder:</strong> This password reset link will expire in 1 hour for your security.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Best regards,<br>
              <strong>The TripMaps Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
};

// Generic email sender function for future use
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendEmail,
  sendEmailVerification,
};
