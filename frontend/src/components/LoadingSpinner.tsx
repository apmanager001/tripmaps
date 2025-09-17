import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = 24,
  className = "",
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Loader2 size={size} className="animate-spin text-primary" />
      {text && <p className="text-sm text-base-content/70">{text}</p>}
    </div>
  );
}
