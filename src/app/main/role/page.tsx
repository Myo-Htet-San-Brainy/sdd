"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

const READ_PERMISSION = "ROLE:READ";
const CREATE_PERMISSION = "ROLE:CREATE";
const UPDATE_PERMISSION = "ROLE:UPDATE";
const DELETE_PERMISSION = "ROLE:DELETE";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
  } = useGetRoles();
  const { mutate } = useDeleteRoleMutation();
  const queryClient = useQueryClient(); // ✨ get query client
  function handleDeleteRole(roleId: string) {
    // console.log("delete role...");
    mutate(
      { roleId },
      {
        onSuccess(data, variables, context) {
          toast.success("Role Deleted!");
        },
        onError(error, variables, context) {
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
    return <div>checking permission...</div>;
  }
  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name
    )
  ) {
    return (
      <div>
        you are not permitted to do role Management. do these instead...
        {Object.values(MODULES_AND_PERMISSIONS).map((module) => {
          return (
            hasPermission(myPermissions!, module.PERMISSION_READ.name) && (
              <Link
                href={module.PERMISSION_READ.link}
                className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
              >
                {module.PERMISSION_READ.displayName}
              </Link>
            )
          );
        })}
      </div>
    );
  }

  if (isFetchingRoles) {
    return <div>fetching roles...</div>;
  }
  if (isErrorRoles) {
    return (
      <div>
        Something went wrong while getting roles for you. do these instead...
        {Object.values(MODULES_AND_PERMISSIONS).map((module) => {
          return (
            module.PERMISSION_READ.name !==
              MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name &&
            hasPermission(myPermissions!, module.PERMISSION_READ.name) && (
              <Link
                href={module.PERMISSION_READ.link}
                className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
              >
                {module.PERMISSION_READ.displayName}
              </Link>
            )
          );
        })}
      </div>
    );
  }
  return (
    <div>
      {hasPermission(
        myPermissions!,
        MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.name
      ) && (
        <Link href={MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.link}>
          {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.displayName}
        </Link>
      )}
      {roles?.map((role) => {
        return (
          <div key={role._id}>
            <h1>{role.name}</h1>
            <div>
              {role.permissions.map((permission) => (
                <p key={permission}>{permission}</p>
              ))}
            </div>
            {hasPermission(
              myPermissions!,
              MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.name
            ) && (
              <Link href={`/main/role/${role._id}/update`}>
                {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_UPDATE.displayName}
              </Link>
            )}
            {hasPermission(
              myPermissions!,
              MODULES_AND_PERMISSIONS.ROLE.PERMISSION_DELETE.name
            ) && (
              <button onClick={() => handleDeleteRole(role._id)}>
                {MODULES_AND_PERMISSIONS.ROLE.PERMISSION_DELETE.displayName}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Page;
