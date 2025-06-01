"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import React from "react";

const Page = () => {
  const router = useRouter();

  function handleSignIn() {
    signIn(undefined, { callbackUrl: "/main" });
  }

  function handleSignUp() {
    router.push("/auth/signup");
  }
  return (
    <div>
      <div className="flex items-center space-x-4">
        <button
          className="text-indigo-700 hover:text-indigo-900 font-medium px-4 py-2"
          onClick={handleSignIn}
        >
          Sign In
        </button>
        {/* <button
          onClick={handleSignUp}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
        >
          Sign Up
        </button> */}
      </div>
    </div>
  );
};

export default Page;
