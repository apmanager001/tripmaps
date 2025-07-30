"use client";
import { useState, useRef } from "react";
import { Upload, X, User, Camera } from "lucide-react";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

const ProfilePictureUpload = ({
  currentUser,
  onUpdate,
  size = "md", // sm, md, lg
  showUserInfo = false,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user, setUser } = useAuthStore();

  // Check if current user is viewing their own profile
  const isOwnProfile = user?._id === currentUser?._id;

  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", fileInputRef.current.files[0]);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/users/profile-picture`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      ).then((res) => res.json());

      if (response.success) {
        toast.success("Profile picture uploaded successfully!");

        // Update local user state
        setUser(response.data.user);

        // Call parent callback if provided
        if (onUpdate) {
          onUpdate(response.data.user);
        }

        // Reset form
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(response.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/users/profile-picture`,
        {
          method: "DELETE",
          credentials: "include",
        }
      ).then((res) => res.json());

      if (response.success) {
        toast.success("Profile picture deleted successfully!");

        // Update local user state
        setUser(response.data.user);

        // Call parent callback if provided
        if (onUpdate) {
          onUpdate(response.data.user);
        }
      } else {
        toast.error(response.message || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.error("Failed to delete profile picture. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const imageUrl =
    currentUser?.profilePicture?.s3Url ||
    currentUser?.profilePicture?.thumbnailUrl ||
    currentUser?.profilePicture?.url; // Add fallback for different URL structures

  // Safety check for currentUser
  if (!currentUser) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="relative group">
          <div
            className={`${sizeClasses[size]} rounded-full bg-base-300 flex items-center justify-center border-2 border-primary`}
          >
            <User size={iconSizes[size]} className="text-primary" />
          </div>
        </div>
        {showUserInfo && (
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary">Loading...</h1>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Profile Picture Display/Upload */}
      <div className="relative group">
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt={`${currentUser?.username || "User"}'s profile picture`}
              className={`${sizeClasses[size]} rounded-full object-cover border-2 border-primary`}
            />
            {/* Overlay with upload/delete options - only show for own profile */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 bg-primary text-white rounded-full hover:bg-primary-focus transition-colors"
                    title="Change photo"
                  >
                    <Camera size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 bg-error text-white rounded-full hover:bg-error-focus transition-colors"
                    title="Delete photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div
              className={`${sizeClasses[size]} rounded-full bg-base-300 flex items-center justify-center border-2 border-primary group-hover:border-primary-focus transition-colors`}
            >
              <User size={iconSizes[size]} className="text-primary" />
            </div>
            {/* Upload button overlay - only show for own profile */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 bg-primary text-white rounded-full hover:bg-primary-focus transition-colors"
                  title="Upload photo"
                >
                  <Camera size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Info - only show if requested */}
      {showUserInfo && (
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary">
            {currentUser?.username}
          </h1>
          {!currentUser?.emailPrivate && (
            <p className="text-sm text-base-content mb-2">
              {currentUser?.email}
            </p>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Preview Profile Picture
            </h3>

            <div className="mb-4">
              <img
                src={preview}
                alt="Profile picture preview"
                className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-primary"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="btn btn-ghost"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary"
              >
                {isUploading ? (
                  <>
                    <div className="loading loading-spinner loading-sm"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
