"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  LogOut,
  Lock,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Calendar,
  Clock,
  Crown,
  Check,
  Globe,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  GlobeLock,
} from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { userApi, authApi, stripeApi, alertApi } from "@/lib/api";
import { performLogout } from "@/lib/performLogout";
import Country from "./settingsComp/country";

export default function Settings() {
  const { user: currentUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const subAbility = process.env.STRIPE_SUBSCRIPTON_ON;

  // Form states
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [bio, setBio] = useState("");
  const [emailPrivate, setEmailPrivate] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [createdDate, setCreatedDate] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Social media states
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
    linkedin: "",
    website: "",
    twitch: "",
    discord: "",
    linktree: "",
  });
  const [isEditingSocial, setIsEditingSocial] = useState(false);

  // Alert settings states
  const [alertSettings, setAlertSettings] = useState({
    followAlerts: true,
    commentAlerts: true,
    likeAlerts: true,
    emailNotifications: true,
    emailFollowAlerts: true,
    emailCommentAlerts: true,
  });

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProfile", currentUser?._id],
    queryFn: () => userApi.getProfile(currentUser._id),
    enabled: !!currentUser?._id,
  });

  // Fetch dashboard data for statistics
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardData", currentUser?._id],
    queryFn: () => userApi.getDashboard(currentUser._id),
    enabled: !!currentUser?._id,
  });

  // Fetch subscription status
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscriptionStatus", currentUser?._id],
    queryFn: () => stripeApi.getSubscriptionStatus(currentUser._id),
    enabled: !!currentUser?._id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(currentUser._id, data),
    onSuccess: (data) => {
      // Check if the response includes a specific message (e.g., for email changes)
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Profile updated successfully!");
      }
      queryClient.invalidateQueries(["userProfile", currentUser._id]);
      setIsEditingEmail(false);
      setIsEditingBio(false);
      setIsEditingSocial(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Logout mutation
  // Initialize form data when user data loads
  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setEmail(user.email || "");
      setNewEmail(user.email || "");
      setBio(user.bio || "");
      setEmailPrivate(user.emailPrivate || false);
      setEmailVerified(user.emailVerified || false);
      setCreatedDate(user.createdDate || "");
      setUpdatedDate(user.updated_at || "");

      // Initialize social media data
      setSocialMedia({
        facebook: user.socialMedia?.facebook || "",
        instagram: user.socialMedia?.instagram || "",
        tiktok: user.socialMedia?.tiktok || "",
        youtube: user.socialMedia?.youtube || "",
        twitter: user.socialMedia?.twitter || "",
        linkedin: user.socialMedia?.linkedin || "",
        website: user.socialMedia?.website || "",
        twitch: user.socialMedia?.twitch || "",
        discord: user.socialMedia?.discord || "",
        linktree: user.socialMedia?.linktree || "",
      });

      // Initialize alert settings data
      setAlertSettings({
        followAlerts: user.alertSettings?.followAlerts !== false,
        commentAlerts: user.alertSettings?.commentAlerts !== false,
        likeAlerts: user.alertSettings?.likeAlerts !== false,
        emailNotifications: user.alertSettings?.emailNotifications !== false,
        emailFollowAlerts: user.alertSettings?.emailFollowAlerts !== false,
        emailCommentAlerts: user.alertSettings?.emailCommentAlerts !== false,
      });
    }
  }, [userData]);

  // Initialize subscription data when it loads
  useEffect(() => {
    if (subscriptionData?.data) {
      setSubscriptionStatus(subscriptionData.data.subscriptionStatus);
      setCurrentPeriodEnd(subscriptionData.data.currentPeriodEnd);
    }
  }, [subscriptionData]);

  const handleEmailUpdate = () => {
    if (!newEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    if (newEmail === email) {
      setIsEditingEmail(false);
      return;
    }

    updateProfileMutation.mutate({ email: newEmail.trim() });
  };

  const handleBioUpdate = () => {
    updateProfileMutation.mutate({ bio: bio.trim() });
  };

  const handleEmailPrivacyToggle = () => {
    updateProfileMutation.mutate({ emailPrivate: !emailPrivate });
  };

  const handleSocialMediaUpdate = () => {
    updateProfileMutation.mutate({ socialMedia });
  };

  const handleAlertSettingToggle = (alertType) => {
    let newSettings = {
      ...alertSettings,
      [alertType]: !alertSettings[alertType],
    };

    // If turning off email notifications, turn off all email sub-settings
    if (
      alertType === "emailNotifications" &&
      alertSettings.emailNotifications
    ) {
      newSettings = {
        ...newSettings,
        emailFollowAlerts: false,
        emailCommentAlerts: false,
      };
    }

    // If turning on email notifications, turn on all email sub-settings
    if (
      alertType === "emailNotifications" &&
      !alertSettings.emailNotifications
    ) {
      newSettings = {
        ...newSettings,
        emailFollowAlerts: true,
        emailCommentAlerts: true,
      };
    }

    setAlertSettings(newSettings);
    updateProfileMutation.mutate({ alertSettings: newSettings });
  };

  const handleLogout = () => {
    performLogout({ clearUser, queryClient, router, setIsLoggingOut });
  };

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, isResend: true }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to send verification email");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Verification email sent successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });

  const handleResendVerification = () => {
    resendVerificationMutation.mutate();
  };

  const handleUpgrade = async () => {
    if (!currentUser?._id) {
      toast.error("User not found");
      return;
    }

    setIsUpgrading(true);
    try {
      const response = await stripeApi.createCheckoutSession(currentUser._id);
      if (response.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to start upgrade process");
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto md:p-6 space-y-6 mb-16">
      {/* Upgrade Subscription - Full Width */}
      {subAbility && (
        <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg border border-primary/20">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-primary" />
              <h2 className="card-title text-xl text-primary">
                {subscriptionStatus === "active"
                  ? "Premium Active"
                  : "Upgrade to Premium"}
              </h2>
            </div>

            {subscriptionStatus === "active" ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">
                    ✓ Premium Active
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentPeriodEnd && (
                      <>
                        Renews on{" "}
                        {new Date(currentPeriodEnd).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>No advertisements</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-success" />
                    <span>Premium features coming soon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-success" />
                    <span>Priority support</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      // TODO: Implement cancel subscription
                      toast.info("Cancel subscription feature coming soon");
                    }}
                    className="btn btn-outline btn-error"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-primary mb-1">
                    $1.99
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>No advertisements</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-success" />
                    <span>Premium features coming soon</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-success" />
                    <span>Priority support</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="btn btn-primary btn-lg flex gap-2"
                  >
                    {isUpgrading ? (
                      <div className="loading loading-spinner loading-sm"></div>
                    ) : (
                      <Crown className="w-5 h-5" />
                    )}
                    {isUpgrading ? "Processing..." : "Upgrade Now"}
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    Cancel anytime. No commitment required.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h2>

              <div className="space-y-4">
                {/* Username */}
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-base-content/60">
                      Username
                    </label>
                    <p className="font-semibold">{currentUser?.username}</p>
                  </div>
                  <div className="badge badge-primary">Can't change</div>
                </div>

                {/* Email */}
                <div className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-base-content/60 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    {!isEditingEmail ? (
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="btn btn-sm btn-ghost"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={handleEmailUpdate}
                          disabled={updateProfileMutation.isPending}
                          className="btn btn-sm btn-primary"
                        >
                          {updateProfileMutation.isPending ? (
                            <div className="loading loading-spinner loading-xs"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmail(false);
                            setNewEmail(email);
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingEmail ? (
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Enter new email"
                    />
                  ) : (
                    <div>
                      <p className="font-semibold">{email}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {emailVerified ? (
                            <div className="flex items-center gap-1 badge badge-success">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-sm">Email verified</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 badge badge-warning">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Email not verified
                                </span>
                              </div>
                              <p className="text-xs text-warning">
                                Verify your email to receive notifications and
                                access all features
                              </p>
                            </div>
                          )}
                        </div>
                        {!emailVerified && (
                          <button
                            onClick={handleResendVerification}
                            disabled={resendVerificationMutation.isPending}
                            className="btn btn-sm  rounded-full btn-warning"
                          >
                            {resendVerificationMutation.isPending ? (
                              <div className="loading loading-spinner loading-xs"></div>
                            ) : (
                              "Resend"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-base-content/60 flex gap-1">
                      <User className="w-4 h-4" />
                      Bio
                    </label>
                    {!isEditingBio ? (
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="btn btn-sm btn-ghost"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={handleBioUpdate}
                          disabled={updateProfileMutation.isPending}
                          className="btn btn-sm btn-primary"
                        >
                          {updateProfileMutation.isPending ? (
                            <div className="loading loading-spinner loading-xs"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingBio(false);
                            setBio(userData?.data?.user?.bio || "");
                          }}
                          className="btn btn-sm btn-ghost"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingBio ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="textarea textarea-bordered w-full"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="font-semibold">{bio || "No bio added yet"}</p>
                  )}
                </div>

                {/* Change Password Button */}
                <div className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-base-content/60 flex gap-1">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <p className="text-sm text-base-content">
                        Change your account password
                      </p>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="btn btn-sm rounded-full btn-error btn-soft"
                    >
                      Change Password
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl">
                <GlobeLock className="w-5 h-5" />
                Privacy Settings
              </h2>

              <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-base-content/60 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email Privacy
                  </label>
                  <p className="text-sm text-base-content">
                    {emailPrivate
                      ? "Your email is hidden from other users"
                      : "Your email is visible to other users"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={emailPrivate}
                  onChange={handleEmailPrivacyToggle}
                  disabled={updateProfileMutation.isPending}
                />
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Settings
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose which activities you want to be notified about
              </p>

              <div className="space-y-4">
                {/* Follow Alerts */}
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-dashed border-info">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        New Followers
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone follows you
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={alertSettings.followAlerts}
                    onChange={() => handleAlertSettingToggle("followAlerts")}
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                {/* Comment Alerts */}
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-dashed border-info">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Map Comments
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone comments on your maps
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={alertSettings.commentAlerts}
                    onChange={() => handleAlertSettingToggle("commentAlerts")}
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                {/* Like Alerts */}
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-dashed border-info">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Likes & Reactions
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when someone likes your maps or POIs
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={alertSettings.likeAlerts}
                    onChange={() => handleAlertSettingToggle("likeAlerts")}
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                {/* Email Notifications - Master Toggle */}
                {/* <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-dashed border-info">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email Notifications (Master)
                      </label>
                      <p className="text-sm text-gray-500">
                        Enable/disable all email notifications
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={alertSettings.emailNotifications}
                    onChange={() =>
                      handleAlertSettingToggle("emailNotifications")
                    }
                    disabled={updateProfileMutation.isPending}
                  />
                </div> */}

                {/* Email Follow Notifications */}
                {/* <div
                  className={`flex items-center justify-between p-3 rounded-lg border border-dashed border-info ${
                    alertSettings.emailNotifications
                      ? "bg-base-200"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          alertSettings.emailNotifications
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        Email for New Followers
                      </label>
                      <p
                        className={`text-sm ${
                          alertSettings.emailNotifications
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        Get email when someone follows you
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={
                      alertSettings.emailFollowAlerts &&
                      alertSettings.emailNotifications
                    }
                    onChange={() =>
                      handleAlertSettingToggle("emailFollowAlerts")
                    }
                    disabled={
                      updateProfileMutation.isPending ||
                      !alertSettings.emailNotifications
                    }
                  />
                </div> */}

                {/* Email Comment Notifications */}
                {/* <div
                  className={`flex items-center justify-between p-3 rounded-lg border border-dashed border-info ${
                    alertSettings.emailNotifications
                      ? "bg-base-200"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          alertSettings.emailNotifications
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        Email for Map Comments
                      </label>
                      <p
                        className={`text-sm ${
                          alertSettings.emailNotifications
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        Get email when someone comments on your maps
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={
                      alertSettings.emailCommentAlerts &&
                      alertSettings.emailNotifications
                    }
                    onChange={() =>
                      handleAlertSettingToggle("emailCommentAlerts")
                    }
                    disabled={
                      updateProfileMutation.isPending ||
                      !alertSettings.emailNotifications
                    }
                  />
                </div> */}
              </div>
            </div>
          </div>
          {/* Logout */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl text-error">Danger Zone</h2>
              <p className="text-sm text-gray-600 mb-4">
                Logging out will end your current session and redirect you to
                the home page.
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-error btn-lg w-full flex gap-2"
              >
                {isLoggingOut ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Dates */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl">Account Information</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created
                    </label>
                    <p className="font-semibold">{formatDate(createdDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Last Updated
                    </label>
                    <p className="font-semibold">{formatDate(updatedDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl">Account Statistics</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardData?.maps?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Maps Created</div>
                </div>
                <div className="text-center p-4 bg-base-200 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {dashboardData?.maps?.reduce(
                      (total, map) => total + (map.views || 0),
                      0
                    ) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
              </div>
            </div>
          </div>
          {/* Countries Visited */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl">Countries Visited</h2>
              <Country />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="md:card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-xl">Social Media Links</h2>
                {!isEditingSocial ? (
                  <button
                    onClick={() => setIsEditingSocial(true)}
                    className="btn btn-sm btn-ghost"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={handleSocialMediaUpdate}
                      disabled={updateProfileMutation.isPending}
                      className="btn btn-sm btn-primary"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSocial(false);
                        // Reset to original values
                        if (userData?.data?.user) {
                          const user = userData.data.user;
                          setSocialMedia({
                            facebook: user.socialMedia?.facebook || "",
                            instagram: user.socialMedia?.instagram || "",
                            tiktok: user.socialMedia?.tiktok || "",
                            youtube: user.socialMedia?.youtube || "",
                            twitter: user.socialMedia?.twitter || "",
                            linkedin: user.socialMedia?.linkedin || "",
                            website: user.socialMedia?.website || "",
                            twitch: user.socialMedia?.twitch || "",
                            discord: user.socialMedia?.discord || "",
                            linktree: user.socialMedia?.linktree || "",
                          });
                        }
                      }}
                      className="btn btn-sm btn-ghost"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Facebook */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="facebook"
                    fgColor="white"
                    bgColor="#1877f2"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Facebook
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.facebook}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            facebook: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://facebook.com/yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.facebook || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="instagram"
                    fgColor="white"
                    bgColor="#e4405f"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Instagram
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.instagram}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            instagram: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://instagram.com/yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.instagram || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* TikTok */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="tiktok"
                    fgColor="white"
                    bgColor="#000000"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      TikTok
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.tiktok}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            tiktok: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://tiktok.com/@yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.tiktok || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* YouTube */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="youtube"
                    fgColor="white"
                    bgColor="#ff0000"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      YouTube
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.youtube}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            youtube: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.youtube || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="twitter"
                    fgColor="white"
                    bgColor="#1da1f2"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Twitter/X
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.twitter}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            twitter: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://twitter.com/yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.twitter || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="linkedin"
                    fgColor="white"
                    bgColor="#0077b5"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      LinkedIn
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.linkedin}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            linkedin: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.linkedin || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Website
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.website}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.website || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Twitch */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="twitch"
                    fgColor="white"
                    bgColor="#9146ff"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Twitch
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.twitch}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            twitch: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://twitch.tv/yourchannel"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.twitch || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Discord */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="discord"
                    fgColor="white"
                    bgColor="#5865f2"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Discord
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="text"
                        value={socialMedia.discord}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            discord: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="YourDiscord#1234"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.discord || "Not added"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linktree */}
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <SocialIcon
                    network="linktree"
                    fgColor="white"
                    bgColor="#39e09b"
                    style={{ width: 20, height: 20 }}
                    as="div"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      Linktree
                    </label>
                    {isEditingSocial ? (
                      <input
                        type="url"
                        value={socialMedia.linktree}
                        onChange={(e) =>
                          setSocialMedia((prev) => ({
                            ...prev,
                            linktree: e.target.value,
                          }))
                        }
                        className="input input-bordered input-sm w-full mt-1"
                        placeholder="https://linktr.ee/yourprofile"
                      />
                    ) : (
                      <p className="font-semibold text-sm">
                        {socialMedia.linktree || "Not added"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
