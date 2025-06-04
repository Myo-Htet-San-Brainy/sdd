"use client";
import { PERMISSIONS } from "@/lib/constants";
import { hasAnyModulePermission, hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import Link from "next/link";
import React from "react";

const REQUESTED_PERMISSION = "ROLE:READ";

const Page = () => {
  const { data: myPermissions, isFetching: isMyPermissionsFetching } =
    useGetMyPermissions();
  if (isMyPermissionsFetching) {
    return <div>loading...</div>;
  }
  if (!hasPermission(myPermissions!, REQUESTED_PERMISSION)) {
    return (
      <div>
        you are not permitted to do role Management. do these instead...
        {PERMISSIONS.map((item) => {
          return (
            <>
              {hasAnyModulePermission(myPermissions!, item.name) && (
                <div>
                  <p className="mt-2 text-left text-sm bg-slate-300 p-2">
                    {item.displayName}
                  </p>
                  {item.actions.map((action) => {
                    return (
                      action.name.includes(":READ") &&
                      hasPermission(myPermissions!, action.name) && (
                        <Link
                          href={action.link!}
                          className="mt-2 w-full p-2 flex gap-2 hover:bg-slate-200 transition-colors"
                        >
                          {action.displayName}
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
  return <div>Role List</div>;
};

export default Page;
