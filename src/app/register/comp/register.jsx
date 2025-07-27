"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        })

        const data = await res.json()

        if (!res.ok || data.success === false) {
            throw new Error(data.message || 'Registration failed')
        }

        return data
    },
    onSuccess: (data) => {
      toast.success("Thanks for Signing Up!")
      
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords don't match");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="max-w-md my-10 mx-auto mt-10 p-6 bg-base-100 border rounded-xl shadow-sm border-base-300">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="fieldset space-y-4">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="input input-bordered w-full"
            placeholder="JaneDoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-bordered w-full"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input input-bordered w-full"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="repeatPassword" className="label">
            Repeat Password
          </label>
          <input
            id="repeatPassword"
            type="password"
            className="input input-bordered w-full"
            placeholder="Repeat password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </fieldset>

        <button
          type="submit"
          className="btn btn-success mt-2"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? "Creating Account..."
            : "Create Account"}
        </button>

        
      </form>

      <p className="text-sm mt-4 text-center">
        Already registered?{" "}
        <a href="/login" className="link link-primary">
          Login
        </a>
      </p>
    </div>
  );
}
