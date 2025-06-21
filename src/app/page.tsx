"use client";

import { signIn } from "next-auth/react";
import React from "react";

const Page = () => {
  function handleSignIn() {
    signIn(undefined, { callbackUrl: "/main" });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-zinc-100 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-red-600 mb-4">
        🏍️ Shwe Da Dar
      </h1>
      <p className="text-lg text-zinc-700 mb-10">
        Best Motorcycle Accessories & Parts Shop In Town
      </p>

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
