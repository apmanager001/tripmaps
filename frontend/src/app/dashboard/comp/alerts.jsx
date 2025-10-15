import React from 'react'
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/lib/api";
import { useVerifyUser } from '@/components/utility/tanstack/verifyUser';

const Alert = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isLoading: isAuthLoading } = useVerifyUser();
    // Fetch alert count
  const { data: alertCountData } = useQuery({
    queryKey: ["alertCount", user?._id],
    queryFn: () => alertApi.getAlertCount(user._id),
    enabled: !isAuthLoading && !!user?._id && !!user?.role, // Only run if auth is loaded and user has both _id and role
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on failure to prevent console errors
  });

  // Fetch alerts for dropdown
  const { data: alertsData, isLoading: isAlertsLoading } = useQuery({
    queryKey: ["alerts", user?._id],
    queryFn: () => alertApi.getUserAlerts(user._id, 1, 10),
    enabled: !isAuthLoading && !!user?._id && !!user?.role, // Only run if auth is loaded and user has both _id and role
    retry: false, // Don't retry on failure to prevent console errors
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (alertId) => alertApi.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(["alertCount", user._id]);
      queryClient.invalidateQueries(["alerts", user._id]);
    },
    onError: (error) => {
      console.error("Error marking alert as read:", error);
    },
  });

  // Mark all alerts as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?._id) throw new Error("User ID not available");
      return alertApi.markAllAlertsAsRead(user._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["alertCount", user._id]);
      queryClient.invalidateQueries(["alerts", user._id]);
    },
    onError: (error) => {
      console.error("Error marking all alerts as read:", error);
    },
  });

  const handleMarkAsRead = (alertId) => {
    markAsReadMutation.mutate(alertId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatAlertTime = (createdAt) => {
    if (!createdAt) return "Unknown";

    try {
      const date = new Date(createdAt);
      const now = new Date();

      // Check if date is valid
      if (isNaN(date.getTime())) return "Unknown";

      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return `${Math.floor(diffInHours / 24)}d ago`;
      }
    } catch (error) {
      console.error("Error formatting alert time:", error);
      return "Unknown";
    }
  };

  return (
    <div
      tabIndex={0}
      className="dropdown-content z-[9999] menu p-2 shadow bg-base-100 rounded-box w-80 "
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {(alertCountData?.data?.unreadCount || 0) > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="btn btn-sm btn-ghost text-xs"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {isAlertsLoading ? (
          <div className="flex justify-center py-4">
            <div className="loading loading-spinner loading-sm"></div>
          </div>
        ) : (alertsData?.data?.alerts || []).length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-2 text-neutral-content ">
            {(alertsData?.data?.alerts || []).map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  alert.isRead
                    ? "bg-base-100 border-base-300"
                    : "bg-blue-50 border-blue-200"
                }`}
                onClick={() => !alert.isRead && handleMarkAsRead(alert._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatAlertTime(alert.createdAt)}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert