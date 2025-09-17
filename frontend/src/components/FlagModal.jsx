import { useState } from "react";
import { X, Flag } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { flagApi } from "@/lib/api";
import toast from "react-hot-toast";

const FlagModal = ({ isOpen, onClose, photoId, photoUrl, locationName }) => {
  const [reason, setReason] = useState("other");
  const [details, setDetails] = useState("");

  const flagMutation = useMutation({
    mutationFn: async () => {
      return flagApi.createFlag({
        photoId,
        reason,
        details: details.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Photo flagged successfully. Thank you for your report.");
      onClose();
      setReason("other");
      setDetails("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to flag photo. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    flagMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl relative z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-error flex items-center gap-2">
            <Flag size={20} />
            Flag Photo
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={flagMutation.isPending}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-neutral-content mb-4">
            Help us keep the community safe by reporting inappropriate content.
            Your report will be reviewed by our team.
          </p>

          {/* Photo Preview */}
          <div className="bg-base-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={photoUrl || "/placeholder-image.webp"}
                alt="Photo being flagged"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium text-sm">
                  Location: {locationName || "Unknown"}
                </p>
                <p className="text-xs text-neutral-500">Photo ID: {photoId}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Reason for flagging
              </span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select select-bordered w-full"
              disabled={flagMutation.isPending}
              required
            >
              <option value="inappropriate">Inappropriate content</option>
              <option value="copyright">Copyright violation</option>
              <option value="spam">Spam or misleading</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Additional Details */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Additional details (optional)
              </span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional context about why this photo should be flagged..."
              className="textarea textarea-bordered w-full h-24"
              disabled={flagMutation.isPending}
              maxLength={500}
            />
            <div className="text-xs text-neutral-500 mt-1 text-right">
              {details.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={flagMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={flagMutation.isPending}
            >
              {flagMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Flagging...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Flag size={16} />
                  Flag Photo
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagModal;
