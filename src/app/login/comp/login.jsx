"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Login Successful!")
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 border rounded-xl shadow-sm border-neutral">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="space-y-4">
          <label htmlFor="identifier" className="label">
            Email or Username
          </label>
          <input
            id="identifier"
            type="text"
            className="input input-bordered w-full"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input input-bordered w-full"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Don’t have an account?{" "}
        <a href="/register" className="link link-primary">
          Register
        </a>
      </p>
    </div>
  );
}
