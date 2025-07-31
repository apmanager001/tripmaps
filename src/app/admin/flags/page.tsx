"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flagApi } from "@/lib/api";
import { Flag, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const AdminFlagsPage = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: flagsData, isLoading } = useQuery({
    queryKey: ["adminFlags", statusFilter, currentPage],
    queryFn: () =>
      flagApi.getAllFlags({
        status: statusFilter,
        page: currentPage,
        limit: 20,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      flagId,
      status,
      adminNotes,
    }: {
      flagId: string;
      status: string;
      adminNotes?: string;
    }) => flagApi.updateFlagStatus(flagId, { status, adminNotes }),
    onSuccess: () => {
      toast.success("Flag status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFlags"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update flag status");
    },
  });

  const handleUpdateStatus = (
    flagId: string,
    status: string,
    adminNotes: string = ""
  ) => {
    updateStatusMutation.mutate({ flagId, status, adminNotes });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "reviewed":
        return <Eye size={16} className="text-blue-500" />;
      case "resolved":
        return <CheckCircle size={16} className="text-green-500" />;
      case "dismissed":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "reviewed":
        return "badge-info";
      case "resolved":
        return "badge-success";
      case "dismissed":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const flags = flagsData?.data?.data || [];
  const totalPages = flagsData?.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Flag size={32} />
              Flag Management
            </h1>
            <p className="text-neutral-600 mt-2">
              Review and manage flagged photos from the community
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Filter by Status</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select select-bordered"
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Flags List */}
        <div className="bg-base-200 rounded-lg p-6">
          {flags.length === 0 ? (
            <div className="text-center py-12">
              <Flag size={48} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">
                No flags found
              </h3>
              <p className="text-neutral-500">
                {statusFilter === "pending"
                  ? "No pending flags to review"
                  : `No ${statusFilter} flags found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag._id}
                  className="bg-base-100 rounded-lg p-6 border border-base-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      <Image
                        src={
                          flag.photoId?.s3Url ||
                          flag.photoId?.thumbnailUrl ||
                          "/placeholder-image.jpg"
                        }
                        alt="Flagged photo"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {flag.poiId?.locationName || "Unknown Location"}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            Map: {flag.mapId?.title || "Unknown Map"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(flag.status)}
                          <span
                            className={`badge ${getStatusColor(flag.status)}`}
                          >
                            {flag.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-600">
                            Flagged by:
                          </p>
                          <p className="text-sm">
                            {flag.flaggedBy?.username || "Unknown User"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-600">
                            Photo owner:
                          </p>
                          <p className="text-sm">
                            {flag.photoOwner?.username || "Unknown User"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-600">
                            Reason:
                          </p>
                          <p className="text-sm capitalize">{flag.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-600">
                            Flagged on:
                          </p>
                          <p className="text-sm">
                            {new Date(flag.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {flag.details && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-neutral-600 mb-1">
                            Details:
                          </p>
                          <p className="text-sm bg-base-200 p-3 rounded">
                            {flag.details}
                          </p>
                        </div>
                      )}

                      {flag.adminNotes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-neutral-600 mb-1">
                            Admin Notes:
                          </p>
                          <p className="text-sm bg-base-200 p-3 rounded">
                            {flag.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {flag.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(flag._id, "resolved")
                            }
                            className="btn btn-success btn-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(flag._id, "dismissed")
                            }
                            className="btn btn-error btn-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle size={16} />
                            Dismiss
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(flag._id, "reviewed")
                            }
                            className="btn btn-info btn-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <Eye size={16} />
                            Mark Reviewed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="join">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="join-item btn"
              >
                «
              </button>
              <button className="join-item btn">
                Page {currentPage} of {totalPages}
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="join-item btn"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFlagsPage;
