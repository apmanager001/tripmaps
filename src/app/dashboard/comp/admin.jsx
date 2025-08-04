"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flagApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Filter,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

const Admin = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch flagged photos
  const {
    data: flagsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminFlags", statusFilter, currentPage],
    queryFn: () =>
      flagApi.getAllFlags({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: 10,
      }),
    enabled: true,
  });

  // Update flag status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ flagId, status, adminNotes }) =>
      flagApi.updateFlagStatus(flagId, { status, adminNotes }),
    onSuccess: () => {
      toast.success("Flag status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFlags"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update flag status");
    },
  });

  const handleStatusUpdate = (flagId, status, adminNotes = "") => {
    updateStatusMutation.mutate({ flagId, status, adminNotes });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "reviewed":
        return <CheckCircle className="w-4 h-4 text-info" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "dismissed":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "badge badge-sm font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} badge-warning`;
      case "reviewed":
        return `${baseClasses} badge-info`;
      case "resolved":
        return `${baseClasses} badge-success`;
      case "dismissed":
        return `${baseClasses} badge-error`;
      default:
        return `${baseClasses} badge-neutral`;
    }
  };

  const getReasonBadge = (reason) => {
    const baseClasses = "badge badge-xs";
    switch (reason) {
      case "inappropriate":
        return `${baseClasses} badge-error`;
      case "copyright":
        return `${baseClasses} badge-warning`;
      case "spam":
        return `${baseClasses} badge-info`;
      default:
        return `${baseClasses} badge-neutral`;
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-error mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Flags</h3>
        <p className="text-base-content/70 mb-4">
          {error.message || "Failed to load flagged photos"}
        </p>
        <button
          onClick={() => refetch()}
          className="btn btn-primary"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content">
            Flagged Photos Management
          </h2>
          <p className="text-base-content/70">
            Review and manage flagged photos from users
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-outline btn-sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-200/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "reviewed", "resolved", "dismissed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`btn btn-sm ${
                    statusFilter === status ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading flagged photos...</p>
        </div>
      )}

      {/* Flags List */}
      {!isLoading && flagsData?.data && (
        <div className="space-y-4">
          {flagsData.data.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-base-content/50 mb-4">
                <AlertTriangle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Flags Found</h3>
              <p className="text-base-content/70">
                {statusFilter === "all"
                  ? "No flagged photos to review"
                  : `No ${statusFilter} flags found`}
              </p>
            </div>
          ) : (
            <>
              {flagsData.data.map((flag) => (
                <div
                  key={flag._id}
                  className="card bg-base-100 border border-base-300 shadow-sm"
                >
                  <div className="card-body p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-base-200">
                          {flag.photoId?.s3Key || flag.photoId?.s3Url ? (
                            <img
                              src={
                                flag.photoId?.s3Key
                                  ? `${
                                      process.env.NEXT_PUBLIC_BACKEND ||
                                      "http://localhost:5000"
                                    }/images/${encodeURIComponent(
                                      flag.photoId.s3Key
                                    )}`
                                  : flag.photoId.s3Url
                              }
                              alt="Flagged photo"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If proxy failed, try direct URL as fallback
                                if (
                                  flag.photoId?.s3Key &&
                                  flag.photoId?.s3Url &&
                                  e.target.src.includes("/images/")
                                ) {
                                  e.target.src = flag.photoId.s3Url;
                                  return;
                                }
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center justify-center text-base-content/50"
                            style={{
                              display:
                                flag.photoId?.s3Key || flag.photoId?.s3Url
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            <Eye className="w-8 h-8" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(flag.status)}
                              <span className={getStatusBadge(flag.status)}>
                                {flag.status.charAt(0).toUpperCase() +
                                  flag.status.slice(1)}
                              </span>
                              <span className={getReasonBadge(flag.reason)}>
                                {flag.reason}
                              </span>
                            </div>
                            <div className="text-sm text-base-content/70">
                              Flagged by{" "}
                              <span className="font-medium">
                                {flag.flaggedBy?.username || "Unknown"}
                              </span>{" "}
                              on {new Date(flag.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Photo Owner:</span>{" "}
                            {flag.photoOwner?.username || "Unknown"}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Location:</span>{" "}
                            {flag.poiId?.locationName || "Unknown"}
                          </div>
                          {flag.details && (
                            <div className="text-sm">
                              <span className="font-medium">Details:</span>{" "}
                              <span className="text-base-content/70">
                                {flag.details}
                              </span>
                            </div>
                          )}
                          {flag.adminNotes && (
                            <div className="text-sm">
                              <span className="font-medium">Admin Notes:</span>{" "}
                              <span className="text-base-content/70">
                                {flag.adminNotes}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {flag.status === "pending" && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(flag._id, "resolved")
                              }
                              className="btn btn-success btn-sm"
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Resolve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(flag._id, "dismissed")
                              }
                              className="btn btn-error btn-sm"
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                              Dismiss
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt(
                                  "Add admin notes (optional):"
                                );
                                if (notes !== null) {
                                  handleStatusUpdate(
                                    flag._id,
                                    "dismissed",
                                    notes
                                  );
                                }
                              }}
                              className="btn btn-outline btn-sm"
                              disabled={updateStatusMutation.isPending}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Dismiss with Notes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {flagsData.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-sm">
                      Page {currentPage} of {flagsData.totalPages}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === flagsData.totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
