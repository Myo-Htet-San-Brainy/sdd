"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
  } = useGetRoles();
  const { mutate } = useDeleteRoleMutation();
  const queryClient = useQueryClient();

  function handleDeleteRole(roleId: string) {
    mutate(
      { roleId },
      {
        onSuccess() {
          toast.success("Role Deleted!");
          queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
        onError(error) {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.success("Role Deleted!");
              queryClient.invalidateQueries({ queryKey: ["roles"] });
            } else {
              toast.error("Role Deletion Failed!");
            }
          }
        },
      }
    );
  }

  if (isFetchingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50 ">
        <p className="text-zinc-800 animate-pulse">Checking permissions...</p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name
    )
  ) {
    return (
      <p className="mt-6 text-center text-red-700">
        You are not permitted to view{" "}
        {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.displayName}.
      </p>
    );
  }

  if (isFetchingRoles) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] py-6 text-center bg-zinc-50 ">
        <p className="text-zinc-800 animate-pulse">Getting roles...</p>
      </div>
    );
  }

  if (isErrorRoles) {
    return (
      <p className="mt-6 text-center text-red-700">
        Something went wrong while getting roles for you...
      </p>
    );
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-6 py-8 mx-auto">
      {hasPermission(
        myPermissions!,
        MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.name
      ) && (
        <div className="mb-6">
          <Link
            href={"/main/role/create"}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Create Role
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {roles?.map((role) => (
          <div
            key={role._id}
            className="border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all bg-white"
          >
            <h2 className="text-xl font-semibold text-zinc-800">{role.name}</h2>

            <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-700">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="bg-zinc-100 text-zinc-800 px-2 py-1 rounded-md"
                >
                  {permission}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              {hasPermission(
                myPermissions!,
                MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.name
              ) && (
                <Link
                  href={`/main/role/${role._id}/update`}
                  className="text-blue-600 hover:underline"
                >
                  {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.displayName}
                </Link>
              )}

              {hasPermission(
                myPermissions!,
                MODULES_AND_PERMISSIONS.ROLE.PERMISSION_DELETE.name
              ) && (
                <button
                  onClick={() => handleDeleteRole(role._id)}
                  className="text-red-700 hover:underline"
                >
                  {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_DELETE.displayName}
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
