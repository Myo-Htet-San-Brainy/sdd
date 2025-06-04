"use client";
import React from "react";

const ErrorBoundary = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  console.log("err from ErrorBoundary", error);
  return <div>Smth unrecoverable happened! Try later!</div>;
};

export default ErrorBoundary;
