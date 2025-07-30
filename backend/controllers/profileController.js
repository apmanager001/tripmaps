const User = require("../model/user");
const {
  upload,
  processProfilePicture,
  createProfileThumbnail,
  uploadProfilePicture,
  deleteProfilePicture,
  generateProfileFileName,
  generateProfilePresignedUrl,
} = require("../services/profilePictureService");

// Upload profile picture
const uploadProfilePictureController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please select an image to upload.",
      });
    }

    const file = req.file;

    // Validate file size (additional check)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${Math.round(
          maxSize / 1024 / 1024
        )}MB. Your file is ${
          Math.round((file.size / 1024 / 1024) * 100) / 100
        }MB.`,
      });
    }

    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only image files are allowed.",
      });
    }

    try {
      // Get current user to check if they have an existing profile picture
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Process profile picture (square crop and resize)
      const processedBuffer = await processProfilePicture(file.buffer);

      // Create thumbnail
      const thumbnailBuffer = await createProfileThumbnail(processedBuffer);

      // Generate filenames with proper extensions
      const originalName = file.originalname || `profile-${Date.now()}.jpg`;
      const profileFileName = generateProfileFileName(originalName, "profile-");
      const thumbnailFileName = generateProfileFileName(originalName, "thumb-");

      // Upload profile picture
      const profileUpload = await uploadProfilePicture(
        processedBuffer,
        profileFileName,
        "profiles"
      );

      // Upload thumbnail
      const thumbnailUpload = await uploadProfilePicture(
        thumbnailBuffer,
        thumbnailFileName,
        "thumbnails"
      );

      // Delete old profile picture if it exists
      if (currentUser.profilePicture?.s3Key) {
        try {
          await deleteProfilePicture(currentUser.profilePicture.s3Key);
          if (currentUser.profilePicture.thumbnailKey) {
            await deleteProfilePicture(currentUser.profilePicture.thumbnailKey);
          }
        } catch (deleteError) {
          console.warn("Failed to delete old profile picture:", deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Update user with new profile picture
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePicture: {
            s3Key: profileUpload.s3Key,
            thumbnailKey: thumbnailUpload.s3Key,
            // Don't store direct URLs - they will be generated as presigned URLs when needed
          },
        },
        { new: true }
      ).select("-password"); // Don't return password

      // Generate presigned URLs for the response
      let userWithPresignedUrls = updatedUser.toObject();
      if (userWithPresignedUrls.profilePicture?.s3Key) {
        const presignedUrl = await generateProfilePresignedUrl(
          userWithPresignedUrls.profilePicture.s3Key
        );
        if (presignedUrl) {
          userWithPresignedUrls.profilePicture.s3Url = presignedUrl;
        }

        if (userWithPresignedUrls.profilePicture?.thumbnailKey) {
          const thumbnailPresignedUrl = await generateProfilePresignedUrl(
            userWithPresignedUrls.profilePicture.thumbnailKey
          );
          if (thumbnailPresignedUrl) {
            userWithPresignedUrls.profilePicture.thumbnailUrl =
              thumbnailPresignedUrl;
          }
        }
      }

      res.json({
        success: true,
        data: {
          user: userWithPresignedUrls,
        },
        message: "Profile picture uploaded successfully",
      });
    } catch (processingError) {
      console.error(
        "Error processing or uploading profile picture:",
        processingError
      );
      return res.status(500).json({
        success: false,
        message:
          "Failed to process or upload profile picture. Please try again with a smaller or different image.",
        error: processingError.message,
      });
    }
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File too large. Maximum size is 5MB. Please compress your image or choose a smaller file.",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected file field. Please ensure you're uploading an image file.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
      error: error.message,
    });
  }
};

// Delete profile picture
const deleteProfilePictureController = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a profile picture
    if (!user.profilePicture?.s3Key) {
      return res.status(404).json({
        success: false,
        message: "No profile picture found",
      });
    }

    // Delete from R2
    try {
      await deleteProfilePicture(user.profilePicture.s3Key);
      if (user.profilePicture.thumbnailKey) {
        await deleteProfilePicture(user.profilePicture.thumbnailKey);
      }
    } catch (deleteError) {
      console.error("Error deleting profile picture from R2:", deleteError);
      // Continue with database update even if R2 deletion fails
    }

    // Update user to remove profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: {
          s3Key: null,
          thumbnailKey: null,
          // Don't store URLs - they will be generated as presigned URLs when needed
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile picture",
    });
  }
};

// Get user profile (with presigned URLs if needed)
const getUserProfile = async (req, res) => {
  console.log("getUserProfile function called");
  console.log("Request params:", req.params);
  console.log("Request user:", req.user);

  try {
    const { userId } = req.params;
    const requestingUserId = req.user?._id;

    console.log("Looking for user with ID:", userId);

    const user = await User.findById(userId).select("-password");
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate presigned URLs for profile pictures if they exist
    if (user.profilePicture?.s3Key) {
      console.log(
        "Generating presigned URL for s3Key:",
        user.profilePicture.s3Key
      );
      const presignedUrl = await generateProfilePresignedUrl(
        user.profilePicture.s3Key
      );
      console.log("Generated presigned URL:", presignedUrl);
      if (presignedUrl) {
        user.profilePicture.s3Url = presignedUrl;
      }

      if (user.profilePicture?.thumbnailKey) {
        console.log(
          "Generating presigned URL for thumbnailKey:",
          user.profilePicture.thumbnailKey
        );
        const thumbnailPresignedUrl = await generateProfilePresignedUrl(
          user.profilePicture.thumbnailKey
        );
        console.log(
          "Generated thumbnail presigned URL:",
          thumbnailPresignedUrl
        );
        if (thumbnailPresignedUrl) {
          user.profilePicture.thumbnailUrl = thumbnailPresignedUrl;
        }
      }
    }

    console.log(
      "Final user object:",
      JSON.stringify(user.profilePicture, null, 2)
    );

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

// Update user profile (bio, etc.)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bio, emailPrivate } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (emailPrivate !== undefined) updateData.emailPrivate = emailPrivate;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  uploadProfilePicture: uploadProfilePictureController,
  deleteProfilePicture: deleteProfilePictureController,
  getUserProfile,
  updateUserProfile,
};
