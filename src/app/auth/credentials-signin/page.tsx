"use client";

import { getCsrfToken } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SignIn() {
  const [csrfToken, setCsrfToken] = useState<string | undefined>();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token || "");
    };
    fetchToken();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-zinc-900">
          🏍️ Shwe Da Dar
        </h1>
        <p className="text-center text-zinc-600 text-sm">
          Best Motorcycle Accessories & Parts Shop In Town
        </p>

        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="space-y-5 pt-4"
        >
          <input name="csrfToken" type="hidden" value={csrfToken} />

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
