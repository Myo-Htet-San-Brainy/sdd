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
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

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
