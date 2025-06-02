"use client";
import { signOut } from "next-auth/react";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <div>
        main navbar
        <button onClick={() => signOut()}>sign out</button>
      </div>
      {children}
    </div>
  );
};

export default layout;
