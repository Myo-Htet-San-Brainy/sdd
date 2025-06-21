"use client";

import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch("/api/message");
        if (!response.ok) {
          throw new Error("Failed to fetch message");
        }
        const data = await response.json();
        setMessage(data.message.content);
      } catch (error) {
        console.error("Error fetching message:", error);
        setMessage("Best Motorcycle Accessories & Parts Shop In Town"); // Fallback message
      } finally {
        setLoading(false);
      }
    }
    fetchMessage();
  }, []);

  function handleSignIn() {
    signIn(undefined, { callbackUrl: "/main" });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-zinc-100 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-red-600 mb-4">
        🏍️ Shwe Da Dar
      </h1>
      {loading ? (
        <p className="text-lg text-zinc-700 mb-10">Loading...</p>
      ) : (
        <p className="text-lg text-zinc-700 mb-10">{message}</p>
      )}

      <button
        onClick={handleSignIn}
        className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow transition"
      >
        Sign In to Continue
      </button>
    </div>
  );
};

export default Page;
