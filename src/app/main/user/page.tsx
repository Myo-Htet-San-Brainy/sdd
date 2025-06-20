"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useDeleteUserMutation, useGetUsers } from "@/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const {
    data: users,
    isFetching: isFetchingUsers,
    isError: isErrorUsers,
  } = useGetUsers({});
  const { mutate } = useDeleteUserMutation();
  const queryClient = useQueryClient();

  function handleDeleteUser(userId: string) {
    mutate(
      { userId },
      {
        onSuccess() {
          toast.success("User Deleted!");
          queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError(error) {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.success("User Deleted!");
              queryClient.invalidateQueries({ queryKey: ["users"] });
            } else {
              toast.error("User Deletion Failed!");
            }
          }
        },
      }
    );
  }

  if (isFetchingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50">
        <p className="text-zinc-800 animate-pulse">Checking permissions...</p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name
    )
  ) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.displayName}.
      </p>
    );
  }

  if (isFetchingUsers) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50">
        <p className="text-zinc-800 animate-pulse">Getting users...</p>
      </div>
    );
  }

  if (isErrorUsers) {
    return (
      <p className="mt-6 text-center text-red-700">
        Something went wrong while getting users for you...
      </p>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8 mx-auto">
      {hasPermission(
        myPermissions!,
        MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
      ) && (
        <div className="mb-6">
          <Link
            href={MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.link}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            {MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.displayName}
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {users?.map((user) => (
          <div
            key={user._id}
            className="border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all bg-white"
          >
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">
              {user.username}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-2 text-sm text-zinc-700">
              <p>
                <span className="font-medium">Role:</span> {user.role}
              </p>
              <p>
                <span className="font-medium">Commission:</span>{" "}
                {user.commissionRate ?? "-"}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {user.phoneNumber}
              </p>
              <p>
                <span className="font-medium">Address:</span> {user.address}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="mt-4 flex gap-4">
              {hasPermission(
                myPermissions!,
                MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.name
              ) && (
                <Link
                  href={`/main/user/${user._id}/update`}
                  className="text-blue-600 hover:underline"
                >
                  {MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.displayName}
                </Link>
              )}
              {hasPermission(
                myPermissions!,
                MODULES_AND_PERMISSIONS.USER.PERMISSION_DELETE.name
              ) && (
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="text-red-700 hover:underline"
                >
                  {MODULES_AND_PERMISSIONS.USER.PERMISSION_DELETE.displayName}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page;
