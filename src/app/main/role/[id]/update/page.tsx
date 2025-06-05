"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRole } from "@/query/role";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const { id } = useParams<{ id: string }>();
  const {
    data: role,
    isFetching: isFetchingRole,
    isError: isErrorRole,
    error: errorRole,
  } = useGetRole({ id });

  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.ROLE.PERMISSION_CREATE.name
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

  if (isFetchingRole) {
    return <div>preparing update form...</div>;
  }

  if (isErrorRole) {
    return (
      <div>
        <p>{errorRole.message || "Something went wrong!"}</p>
        <Link href={"/main/role"}>View other Roles</Link>
      </div>
    );
  }

  return <div>ROLE UPDATE</div>;
};

export default Page;
