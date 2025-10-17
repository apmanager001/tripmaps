"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/verify-email/${token}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setIsSuccess(true);
          toast.success("Email verified successfully!");
        } else {
          setError(data.message || "Verification failed");
          toast.error(data.message || "Verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setError("An error occurred during verification");
        toast.error("An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  const handleRedirect = () => {
    router.push("/login");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-300 p-4">
        <div className="max-w-md w-full rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Email
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-300 p-4">
      <div className="max-w-md w-full bg-base-300 rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2">
              Email Verified!
            </h1>
            <p className="text-base-content/80 mb-6">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>
            <button
              onClick={handleRedirect}
              className="btn btn-primary"
            >
              Continue to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-2">
              Verification Failed
            </h1>
            <p className="text-base-content/80 mb-6">
              {error || "The verification link is invalid or has expired."}
            </p>
            <button
              onClick={handleRedirect}
              className="btn btn-primary w-full rounded-xl"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
