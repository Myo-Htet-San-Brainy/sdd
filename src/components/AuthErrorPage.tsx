"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast"; // or whatever toast lib you're using
import { signIn } from "next-auth/react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      let errorMessage = "";

      switch (error) {
        case "MissingCredentials":
          errorMessage = "Please fill in both username and password.";
          break;
        case "InvalidCredentials":
          errorMessage = "Invalid username or password.";
          break;
        case "ServerError":
          errorMessage = "Internal server error. Try again later.";
          break;
        default:
          errorMessage = "Something went wrong. Please try again.";
      }

      toast.error(errorMessage);
    }

    // After showing toast, redirect to sign-in page or home
    const timeout = setTimeout(() => {
      signIn(undefined, { callbackUrl: "/main" });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [error]);

  return <div className="text-center mt-10 text-lg">Redirecting...</div>;
}
