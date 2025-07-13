"use client";

import { useGetMyAccount, useGetMyPermissions } from "@/query/miscellaneous";
import Link from "next/link";
import { globalNavbarData } from "@/lib/constants";
import React from "react";
import { useSession } from "next-auth/react";
import { ProfileDropdown } from "./ProfileDropdown";
import { useGetUser } from "@/query/user";

const GlobalNavbarSkeleton = () => {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-20 h-6 bg-gray-200 rounded-md" />
      <div className="w-24 h-6 bg-gray-200 rounded-md" />
      <div className="w-16 h-6 bg-gray-200 rounded-md" />
    </div>
  );
};

const GlobalNavbar = () => {
  const { data: myPermissions, isFetching: isMyPermissionsFetching } =
    useGetMyPermissions();
  const { data: profile } = useGetUser({ id: "own" });

  // Helper function to check if user has any of the required permissions
  const hasAnyRequiredPermission = (requiredPermissions: string[]) => {
    if (!myPermissions) return false;
    return requiredPermissions.some((permission) =>
      myPermissions.includes(permission)
    );
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="text-xl font-semibold tracking-wide text-red-700">
          🏍️ Shwe Da Dar
        </div>

        {isMyPermissionsFetching ? (
          <GlobalNavbarSkeleton />
        ) : (
          <div className="flex gap-6 items-center text-sm font-medium text-gray-700">
            {globalNavbarData.map((navItem) => {
              if (hasAnyRequiredPermission(navItem.requiredPermissions)) {
                return (
                  <Link
                    key={navItem.id}
                    href={navItem.link}
                    className="hover:text-red-600 transition-colors"
                  >
                    {navItem.displayName}
                  </Link>
                );
              }
              return null;
            })}
          </div>
        )}

        {profile && <ProfileDropdown profile={profile} />}
      </div>
    </nav>
  );
};

export default GlobalNavbar;
