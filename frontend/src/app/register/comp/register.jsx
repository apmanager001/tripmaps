"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("Account created successfully! Welcome aboard! 🎉");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/auth/google`;
    } catch (error) {
      toast.error("Google registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookRegister = async () => {
    setIsLoading(true);
    try {
      // Redirect to Facebook OAuth
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/auth/facebook`;
    } catch (error) {
      toast.error("Facebook registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !repeatPassword.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== repeatPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex md:items-center justify-center bg-base-300 md:p-4">
      <div className="max-w-md w-full bg-base-100 md:rounded-2xl shadow-xl md:border border-neutral p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold  mb-2">Create Account</h1>
          <p className="text-sm text-neutral-400">
            Join us and start mapping your adventures
          </p>
        </div>

        {/* Social Registration Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="btn bg-white text-black border-[#e5e5e5] w-full rounded-2xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* <button
            onClick={handleFacebookRegister}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button> */}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-base-100 ">Or sign up with email</span>
          </div>
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full input"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label
              htmlFor="repeatPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <input
              id="repeatPassword"
              type="password"
              className="w-full input"
              placeholder="Confirm your password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              disabled={registerMutation.isPending}
              autoComplete="off"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary rounded-lg"
            disabled={registerMutation.isPending || isLoading}
          >
            {registerMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-accent font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
