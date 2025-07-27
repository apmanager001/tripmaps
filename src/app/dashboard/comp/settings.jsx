"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { userApi, authApi } from "@/lib/api";

export default function Settings() {
  const { user: currentUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Form states
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [bio, setBio] = useState("");
  const [emailPrivate, setEmailPrivate] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [createdDate, setCreatedDate] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");

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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(currentUser._id, data),
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["userProfile", currentUser._id]);
      setIsEditingEmail(false);
      setIsEditingBio(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
        return true;
      } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, we should still clear local state
        return false;
      }
    },
    onSuccess: (success) => {
      // Always clear user state regardless of API success
      clearUser();

      if (success) {
        toast.success("Logged out successfully");
      } else {
        toast.success("Logged out (local session cleared)");
      }

      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout mutation error:", error);
      // Even on error, clear local state and redirect
      clearUser();
      toast.success("Logged out (local session cleared)");
      window.location.href = "/";
    },
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (userData?.data?.user) {
      const user = userData.data.user;
      setEmail(user.email || "");
      setNewEmail(user.email || "");
      setBio(user.bio || "");
      setEmailPrivate(user.emailPrivate || false);
      setCreatedDate(user.createdDate || "");
      setUpdatedDate(user.updated_at || "");
    }
  }, [userData]);

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

  const handleLogout = () => {
    logoutMutation.mutate();
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary text-center mb-8">
        Settings
      </h1>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h2>

              <div className="space-y-4">
                {/* Username */}
                <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Username
                    </label>
                    <p className="font-semibold">{currentUser?.username}</p>
                  </div>
                  <div className="badge badge-primary">Cannot change</div>
                </div>

                {/* Email */}
                <div className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
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
                    <p className="font-semibold">{email}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-600">
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
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl">Privacy Settings</h2>

              <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email Privacy
                  </label>
                  <p className="text-sm text-gray-500">
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Dates */}
          <div className="card bg-base-100 shadow-lg">
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
          <div className="card bg-base-100 shadow-lg">
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

          {/* Logout */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-xl text-error">Danger Zone</h2>
              <p className="text-sm text-gray-600 mb-4">
                Logging out will end your current session and redirect you to
                the home page.
              </p>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="btn btn-error btn-lg w-full flex gap-2"
              >
                {logoutMutation.isPending ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
