"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRoles } from "@/query/role";
import Link from "next/link";
import React from "react";

const PERMISSION_FOR_PAGE = "ROLE:READ";

const Page = () => {
  const { data: myPermissions, isFetching: isFetchingMyPermissions } =
    useGetMyPermissions();
  const {
    data: roles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
  } = useGetRoles();
  if (isFetchingMyPermissions) {
    return <div>checking permission...</div>;
  }
  if (!hasPermission(myPermissions!, PERMISSION_FOR_PAGE)) {
    return (
      <div>
        you are not permitted to do role Management. do these instead...
        {MODULES_AND_PERMISSIONS.map((module) => {
          return (
            hasPermission(myPermissions!, module.displayPermission.name) && (
              <>
                <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                  {module.displayName}
                </p>
                <Link
                  href={module.displayPermission.link}
                  className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                >
                  {module.displayPermission.displayName}
                </Link>
              </>
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
        {MODULES_AND_PERMISSIONS.map((module) => {
          return (
            module.displayPermission.name !== PERMISSION_FOR_PAGE &&
            hasPermission(myPermissions!, module.displayPermission.name) && (
              <>
                <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                  {module.displayName}
                </p>
                <Link
                  href={module.displayPermission.link}
                  className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                >
                  {module.displayPermission.displayName}
                </Link>
              </>
            )
          );
        })}
      </div>
    );
  }
  return (
    <div>
      {roles?.map((role) => {
        return (
          <div key={role._id}>
            <h1>{role.name}</h1>
            <div>
              {role.permissions.map((permission) => (
                <p key={permission}>{permission}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
