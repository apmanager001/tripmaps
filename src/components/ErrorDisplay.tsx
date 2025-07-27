import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  error,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div className={`alert alert-error ${className}`}>
      <AlertTriangle className="w-5 h-5" />
      <div className="flex-1">
        <h3 className="font-semibold">Error</h3>
        <p className="text-sm">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-ghost"
          title="Retry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
