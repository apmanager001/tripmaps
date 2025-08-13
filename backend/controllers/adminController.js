const User = require("../model/user.js");
const { sendAlertEmail } = require("../services/emailService");

// Get user statistics for admin dashboard
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });

    // Get users by role
    const adminUsers = await User.countDocuments({ role: "admin" });
    const moderatorUsers = await User.countDocuments({ role: "moderator" });
    const memberUsers = await User.countDocuments({ role: "member" });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        adminUsers,
        moderatorUsers,
        memberUsers,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
    });
  }
};

// Send email to all users
const sendEmailToAllUsers = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Subject and content are required",
      });
    }

    // Get all users with verified emails
    const users = await User.find({
      emailVerified: true,
      emailPrivate: false, // Don't send to users who have made their email private
    }).select("email username");

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No verified users found to send emails to",
      });
    }

    // Send emails to all users with HTML content
    const emailPromises = users.map((user) =>
      sendAlertEmail(
        user.email,
        "admin_broadcast",
        `Hello ${user.username},\n\n${htmlContent}`,
        null
      )
    );

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);

    // Count successful and failed emails
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;
    const failed = results.length - successful;

    // Log the broadcast
    console.log(
      `Admin broadcast email sent to ${successful} users. Failed: ${failed}`
    );

    res.json({
      success: true,
      message: `Email sent successfully to ${successful} users`,
      data: {
        totalUsers: users.length,
        successful,
        failed,
        subject,
      },
    });
  } catch (error) {
    console.error("Error sending email to all users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email to users",
    });
  }
};

// Get all users (paginated) for admin management
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const verified = req.query.verified;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (verified !== undefined) {
      query.emailVerified = verified === "true";
    }

    // Get users with pagination
    const users = await User.find(query)
      .select("-password -emailVerificationToken -emailVerificationExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["member", "moderator", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be member, moderator, or admin",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

module.exports = {
  getUserStats,
  sendEmailToAllUsers,
  getAllUsers,
  updateUserRole,
};
