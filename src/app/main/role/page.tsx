"use client";
import AllowedPermissions from "@/components/AllowedPermissions";
import FallbackPermissions from "@/components/FallbackPermissions";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
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
      <AllowedPermissions
        actionNotPermitted={MODULES_AND_PERMISSIONS.ROLE.displayName}
        myPermissions={myPermissions!}
      />
    );
  }

  if (isFetchingRoles) {
    return <div>fetching roles...</div>;
  }
  if (isErrorRoles) {
    return (
      <FallbackPermissions
        myPermissions={myPermissions!}
        errorAction={MODULES_AND_PERMISSIONS.ROLE.PERMISSION_READ.name}
        errorActionTitle={"getting roles"}
      />
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
