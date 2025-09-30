"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to send reset email");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Password reset email sent! Check your inbox.");
      router.push("/login");
    },
    onError: (err) => {
      toast.error(
        err.message || "Failed to send reset email. Please try again."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    forgotPasswordMutation.mutate();
  };

  return (
    <div className="min-h-screen flex md:items-center justify-center bg-base-300 md:p-4">
      <div className="max-w-md w-full bg-base-100 md:rounded-2xl shadow-xl md:border border-neutral p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Forgot Password
          </h1>
          <p className="text-neutral-400 text-sm">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium  mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={forgotPasswordMutation.isPending}
              autoComplete="email"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary rounded-lg"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Email...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-accent font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-accent font-medium hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
