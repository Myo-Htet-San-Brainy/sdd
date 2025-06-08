"use client";
import AllowedPermissions from "@/components/AllowedPermissions";
import FallbackPermissions from "@/components/FallbackPermissions";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { CustomError } from "@/lib/CustomError";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useDeleteRoleMutation, useGetRoles } from "@/query/role";
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
  } = useGetUsers();
  const { mutate } = useDeleteUserMutation();
  function handleDeleteUser(userId: string) {
    mutate(
      { userId },
      {
        onSuccess(data, variables, context) {
          toast.success("User Deleted!");
        },
        onError(error, variables, context) {
          if (error instanceof CustomError) {
            if (error.status === 404) {
              toast.success("User Deleted!");
            } else {
              toast.error("User Deletion Failed!");
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
      MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name
    )
  ) {
    return (
      <AllowedPermissions
        actionNotPermitted={MODULES_AND_PERMISSIONS.USER.displayName}
        myPermissions={myPermissions!}
      />
    );
  }

  if (isFetchingUsers) {
    return <div>fetching users...</div>;
  }
  if (isErrorUsers) {
    return (
      <FallbackPermissions
        myPermissions={myPermissions!}
        errorAction={MODULES_AND_PERMISSIONS.USER.PERMISSION_READ.name}
        errorActionTitle={"getting users"}
      />
    );
  }
  return (
    <div>
      {hasPermission(
        myPermissions!,
        MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.name
      ) && (
        <Link href={MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.link}>
          {MODULES_AND_PERMISSIONS.USER.PERMISSION_CREATE.displayName}
        </Link>
      )}
      {users?.map((user) => {
        return (
          <div key={user._id}>
            <p>{user.username}</p>
            <p>{user.role}</p>
            <p>{user.commissionRate && user.commissionRate}</p>
            <p>{user.phoneNumber}</p>
            <p>{user.address}</p>
            <p>{user.isActive ? "active" : "inactive"}</p>
            {hasPermission(
              myPermissions!,
              MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.name
            ) && (
              <Link href={`/main/user/${user._id}/update`}>
                {MODULES_AND_PERMISSIONS.USER.PERMISSION_UPDATE.displayName}
              </Link>
            )}
            {hasPermission(
              myPermissions!,
              MODULES_AND_PERMISSIONS.USER.PERMISSION_DELETE.name
            ) && (
              <button onClick={() => handleDeleteUser(user._id)}>
                {MODULES_AND_PERMISSIONS.USER.PERMISSION_DELETE.displayName}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Page;
