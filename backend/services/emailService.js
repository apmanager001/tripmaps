const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport (consistent with mailcontroller.js)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ALERT_EMAIL_USER || process.env.EMAIL_USER,
      pass: process.env.ALERT_EMAIL_PASS || process.env.EMAIL_PASS,
    },
  });
};

// Send alert email
const sendAlertEmail = async (
  userEmail,
  alertType,
  alertMessage,
  targetUrl = null
) => {
  const alertEmailUser = process.env.ALERT_EMAIL_USER || process.env.EMAIL_USER;
  const alertEmailPass = process.env.ALERT_EMAIL_PASS || process.env.EMAIL_PASS;

  if (!alertEmailUser || !alertEmailPass) {
    console.log("Alert email service not configured - skipping email send");
    return {
      success: true,
      message: "Email disabled - alert created successfully",
    };
  }

  try {
    const transporter = createTransporter();

    // Define email templates based on alert type
    let subject, htmlContent;

    switch (alertType) {
      case "follow":
        subject = "🎉 New Follower on My Trip Maps";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Follower!</h2>
            <p>${alertMessage}</p>
            <p>Visit your dashboard to see more details.</p>
            ${
              targetUrl
                ? `<a href="${targetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>`
                : ""
            }
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you have email notifications enabled for new followers. 
              You can change your notification preferences in your account settings.
            </p>
          </div>
        `;
        break;

      case "comment":
        subject = "💬 New Comment on Your Map";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">New Comment!</h2>
            <p>${alertMessage}</p>
            <p>Check out what they said and join the conversation!</p>
            ${
              targetUrl
                ? `<a href="${targetUrl}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a>`
                : ""
            }
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you have email notifications enabled for map comments. 
              You can change your notification preferences in your account settings.
            </p>
          </div>
        `;
        break;

      case "like":
      case "map_like":
      case "poi_like":
        subject = "❤️ Someone Liked Your Content";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">New Like!</h2>
            <p>${alertMessage}</p>
            <p>Your content is getting noticed!</p>
            ${
              targetUrl
                ? `<a href="${targetUrl}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Content</a>`
                : ""
            }
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you have email notifications enabled for likes. 
              You can change your notification preferences in your account settings.
            </p>
          </div>
        `;
        break;

      default:
        subject = "🔔 New Notification on My Trip Maps";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Notification!</h2>
            <p>${alertMessage}</p>
            <p>Visit your dashboard to see more details.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you have email notifications enabled. 
              You can change your notification preferences in your account settings.
            </p>
          </div>
        `;
    }

    const mailOptions = {
      from: `"My Trip Maps Alerts" <${alertEmailUser}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Alert email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending alert email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendAlertEmail,
};
