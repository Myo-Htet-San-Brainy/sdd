"use client";

import { useGetMyPermissions } from "@/query/miscellaneous";
import Link from "next/link";
import { hasPermission } from "@/lib/utils";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import React from "react";
import { signOut } from "next-auth/react";

const GlobalNavbar = () => {
  const { data: myPermissions, isFetching: isMyPermissionsFetching } =
    useGetMyPermissions();
  function handleSignOut() {
    signOut();
  }

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="text-xl font-semibold tracking-wide text-red-700">
          🏍️ Shwe Da Dar
        </div>

        {isMyPermissionsFetching ? (
          <div className="flex gap-4 animate-pulse">
            <div className="w-20 h-6 bg-gray-200 rounded-md" />
            <div className="w-24 h-6 bg-gray-200 rounded-md" />
            <div className="w-16 h-6 bg-gray-200 rounded-md" />
          </div>
        ) : (
          <div className="flex gap-6 items-center text-sm font-medium text-gray-700">
            {Object.values(MODULES_AND_PERMISSIONS).map((module) => {
              if ("PERMISSION_READ" in module) {
                const { PERMISSION_READ } = module;
                return (
                  hasPermission(myPermissions!, PERMISSION_READ.name) && (
                    <Link
                      key={PERMISSION_READ.name}
                      href={PERMISSION_READ.link}
                      className="hover:text-red-600 transition-colors"
                    >
                      {PERMISSION_READ.displayName}
                    </Link>
                  )
                );
              } else {
                const permissionEntries = Object.entries(module).filter(
                  ([key, value]) =>
                    key.startsWith("PERMISSION_") &&
                    typeof value === "object" &&
                    "name" in value &&
                    typeof value.name === "string"
                ) as [string, { name: string }][]; // TS-safe casting

                const hasAnyPermission = permissionEntries.some(([_, perm]) =>
                  hasPermission(myPermissions!, perm.name)
                );

                return (
                  hasAnyPermission && (
                    <Link
                      key={module.displayName}
                      href={module.link}
                      className="hover:text-red-600 transition-colors"
                    >
                      {module.displayName}
                    </Link>
                  )
                );
              }
            })}
          </div>
        )}

        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
