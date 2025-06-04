"use client";
import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { useGetRoles } from "@/query/role";
import Link from "next/link";
import React from "react";

const REQUESTED_PERMISSION = "ROLE:READ";
const REQUESTED_MODULE = "ROLE";

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
  if (!hasPermission(myPermissions!, REQUESTED_PERMISSION)) {
    return (
      <div>
        you are not permitted to do role Management. do these instead...
        {MODULES_AND_PERMISSIONS.map((item) => {
          return (
            <>
              {hasAnyModulePermission(myPermissions!, item.name) && (
                <div>
                  <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                    {item.displayName}
                  </p>
                  {item.permissions.map((permission) => {
                    return (
                      permission.name.includes(":READ") &&
                      hasPermission(myPermissions!, permission.name) && (
                        <Link
                          href={permission.link!}
                          className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                        >
                          {permission.displayName}
                        </Link>
                      )
                    );
                  })}
                </div>
              )}
            </>
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
        {MODULES_AND_PERMISSIONS.map((item) => {
          return (
            <>
              {item.name !== REQUESTED_MODULE &&
                hasAnyModulePermission(myPermissions!, item.name) && (
                  <div>
                    <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                      {item.displayName}
                    </p>
                    {item.permissions.map((permission) => {
                      return (
                        permission.name.includes(":READ") &&
                        hasPermission(myPermissions!, permission.name) && (
                          <Link
                            href={permission.link!}
                            className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                          >
                            {permission.displayName}
                          </Link>
                        )
                      );
                    })}
                  </div>
                )}
            </>
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
